import React, { useState, useEffect } from 'react';
import { Package, Eye, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { compressImage } from '../../utils/checkoutUtils';
import { toast } from 'sonner';

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
    pending_approval: { label: 'Pendiente de aprobación', color: 'text-yellow-600', dot: 'bg-yellow-500' },
    approved_pending_payment: { label: 'Aprobado - Pendiente de pago', color: 'text-blue-600', dot: 'bg-blue-500' },
    payment_review: { label: 'Revisando pago', color: 'text-purple-600', dot: 'bg-purple-500' },
    preparing: { label: 'Preparando tu orden', color: 'text-indigo-600', dot: 'bg-indigo-500' },
    shipped: { label: 'Enviado', color: 'text-cyan-600', dot: 'bg-cyan-500' },
    delivered: { label: 'Entregado', color: 'text-green-600', dot: 'bg-green-500' },
    rejected: { label: 'Rechazado', color: 'text-red-600', dot: 'bg-red-500' },
    cancelled: { label: 'Cancelado', color: 'text-gray-600', dot: 'bg-gray-400' },
};

export const OrdersTab = ({ user, selectedOrder, setSelectedOrder }: any) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const RECEIPT_BLOCKED = ['cancelled', 'rejected'];

    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingId(orderId);
        try {
            const compressedBlob = await compressImage(file);
            const fileName = `${orderId}.jpg`;
            const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, compressedBlob, { contentType: 'image/jpeg', upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);
            await supabase.from('orders').update({ receipt_url: publicUrl }).eq('id', orderId);

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, receipt_url: publicUrl } : o));
            setSelectedOrder((prev: any) => prev ? { ...prev, receipt_url: publicUrl } : prev);
            toast.success('Comprobante subido con éxito');
            // Fire-and-forget: notify admin about the uploaded receipt
            supabase.functions.invoke('notify-admin', {
                body: {
                    title: '🧾 Comprobante recibido',
                    body: `El cliente subió el comprobante del pedido #${orderId.slice(0, 8).toUpperCase()}`,
                    data: { orderId, type: 'receipt_uploaded' },
                },
            }).catch(() => { /* non-blocking */ });
        } catch (err: any) {
            toast.error(`Error al subir comprobante: ${err?.message ?? 'Error desconocido'}`);
        } finally {
            setUploadingId(null);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.email) { setOrdersLoading(false); return; }
            const { data } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            setOrders(data || []);
            setOrdersLoading(false);
        };
        fetchOrders();
    }, [user]);

    if (selectedOrder) {
        const statusInfo = ORDER_STATUS_LABELS[selectedOrder.status] || { label: selectedOrder.status, color: 'text-gray-600', dot: 'bg-gray-400' };
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="profile-page-title">Detalle del Pedido</h2>
                </div>

                <div className="profile-card space-y-6">
                    <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-gray-50">
                        <div>
                            <p className="text-sm text-gray-500">Fecha de compra</p>
                            <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Número de orden</p>
                            <p className="font-medium">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="font-medium text-lg">${Number(selectedOrder.total).toLocaleString('es-CL')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
                        </div>
                    </div>

                    {selectedOrder.notes && (
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">Información de envío</h3>
                            {(selectedOrder.tracking_number || selectedOrder.carrier_name) && (
                                <div className="p-3 mb-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
                                    <p className="font-semibold text-sm">Transporte: {selectedOrder.carrier_name || 'No especificado'}</p>
                                    <p className="font-semibold text-sm">N° Seguimiento: {selectedOrder.tracking_number || 'Pendiente'}</p>
                                    {selectedOrder.expected_delivery_date && (
                                        <p className="text-sm mt-1">Entrega estimada: {new Date(selectedOrder.expected_delivery_date).toLocaleDateString('es-CL')}</p>
                                    )}
                                </div>
                            )}
                            <div className="text-gray-600 text-sm space-y-1">
                                {selectedOrder.notes.split(' | ').map((line: string, i: number) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {!selectedOrder.receipt_url && !RECEIPT_BLOCKED.includes(selectedOrder.status) && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <h3 className="font-bold text-yellow-800 mb-2">Falta comprobante de pago</h3>
                            <p className="text-sm text-yellow-700 mb-4">Sube tu comprobante de transferencia para que podamos procesar tu pedido.</p>
                            <label className={`w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-brand-primary)] cursor-pointer ${uploadingId === selectedOrder.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                {uploadingId === selectedOrder.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload size={16} />}
                                {uploadingId === selectedOrder.id ? 'Subiendo...' : 'Subir Comprobante'}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleReceiptUpload(e, selectedOrder.id)} disabled={uploadingId === selectedOrder.id} />
                            </label>
                        </div>
                    )}
                    {selectedOrder.receipt_url && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <h3 className="font-bold text-gray-800 mb-2">Comprobante subido</h3>
                            <a href={selectedOrder.receipt_url} target="_blank" rel="noreferrer" className="text-[var(--color-brand-primary)] text-sm font-medium hover:underline">
                                Ver comprobante adjunto
                            </a>
                        </div>
                    )}
                </div>

                <div className="profile-card">
                    <h3 className="font-bold text-[var(--color-brand-primary)] border-l-4 border-[var(--color-brand-primary)] pl-3 mb-6">
                        Productos ({selectedOrder.order_items?.length || 0})
                    </h3>
                    <div className="space-y-4">
                        {(selectedOrder.order_items || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                    <Package size={28} className="text-gray-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{item.product_name}</h4>
                                    <p className="text-sm text-gray-600">{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'} — ${Number(item.price).toLocaleString('es-CL')} c/u</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="profile-page-title">Mis Compras</h2>
            {ordersLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-[var(--color-brand-primary)]" />
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state-card text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No tienes compras todavía</p>
                    <Link to="/" className="inline-block mt-4 text-[var(--color-brand-primary)] font-bold hover:underline">Ver productos</Link>
                </div>
            ) : orders.map((order: any) => {
                const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'text-gray-600', dot: 'bg-gray-400' };
                const firstItem = order.order_items?.[0];
                return (
                    <div key={order.id} className="profile-card">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-50 pb-4">
                            <div>
                                <p className="text-sm text-gray-500">Fecha de compra</p>
                                <p className="font-medium">{new Date(order.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="font-medium">${Number(order.total).toLocaleString('es-CL')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Número de orden</p>
                                <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-[var(--color-brand-primary)] text-sm font-medium hover:underline flex items-center gap-1"
                            >
                                <Eye size={16} />
                                Ver detalles
                            </button>
                        </div>
                        {firstItem && (
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
                                    <Package size={24} className="text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{firstItem.product_name}</h3>
                                    <p className="text-sm text-gray-600">{firstItem.quantity} {firstItem.quantity === 1 ? 'unidad' : 'unidades'}</p>
                                </div>
                            </div>
                        )}
                        <div className={`mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 ${statusInfo.color} text-sm font-medium`}>
                            <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.label}
                        </div>
                        {!order.receipt_url && !RECEIPT_BLOCKED.includes(order.status) && (
                            <div className="mt-3 pt-3 border-t border-gray-50">
                                <label className={`inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-primary)] cursor-pointer hover:underline ${uploadingId === order.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {uploadingId === order.id
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <Upload size={14} />}
                                    {uploadingId === order.id ? 'Subiendo...' : 'Adjuntar comprobante de pago'}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleReceiptUpload(e, order.id)} disabled={uploadingId === order.id} />
                                </label>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
