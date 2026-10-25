// @use(kind, limit, scope, compose, goodPractice)
// @kind(page)
// @limit(lines: 334, reason: "refactor pendiente: extraer toolbar, grid, list view y modal a componentes separados. Ver BUG-034")
// @scope(features:properties)
// @compose(PublicationsToolbar, PublicationsGridView, PublicationsListView, PropertyFormModal, IgMediaSelector)
// @goodPractice("Separates publications list into grid/list views with toolbar for filtering, searching, and creating.")
// @goodPractice("Uses ConfirmModal for destructive actions to prevent accidental deletions.")
import { Plus, ImagePlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ConfirmModal } from '../components/ui/confirm-modal';
import { PublicacionesSkeleton } from '../components/Skeletons';
import type { Publicacion } from '../types';
import { lazy, Suspense } from 'react';
const IgQuickPublishModal = lazy(() => import('../features/properties/components/IgQuickPublishModal').then(m => ({ default: m.IgQuickPublishModal })));
const PropertyFormModal = lazy(() => import('../features/properties/components/PropertyFormModal').then(m => ({ default: m.PropertyFormModal })));
import { PublicationDetailDialog } from '../features/properties/components/PublicationDetailDialog';
import { PublicationsToolbar, FILTER_OPTIONS } from '../features/properties/components/PublicationsToolbar';
import { PublicationsGridView } from '../features/properties/components/PublicationsGridView';
import { PublicationsListView } from '../features/properties/components/PublicationsListView';
import { useProperties } from '../features/properties/hooks/useProperties';
import { usePropertyFilters } from '../features/properties/hooks/usePropertyFilters';
import { usePublicacionModals } from '../features/properties/hooks/usePublicacionModals';
import { useBulkSelection } from '../features/properties/hooks/useBulkSelection';
import { useServiceStatus } from '../hooks/useServiceStatus';
import { useNetworkGuard } from '../hooks/useNetworkGuard';
import { propertiesApi } from '../lib/api/properties';
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import type { IgMedia } from '../types';

const PAGE_SIZE = 30;

/* ── Main Component ──────────────────────────────────────────────── */
export function Publicaciones() {
  const { items, loading, error, syncStatuses, save, remove, toggle, toggleFeatured, publishIG, unlinkIG, refresh } = useProperties();
  const { search, setSearch, filtro, setFiltro, sort, setSort, categoriaFiltro, setCategoriaFiltro, applyFilters } = usePropertyFilters();
  const { notify: showNotification } = useNotification();
  const { instagram: igHealth } = useServiceStatus();
  const igAvailable = igHealth === 'healthy' || igHealth === 'unknown';

  const {
    isFormOpen, editItem, openForm, closeForm,
    deleteItem, openDelete, closeDelete,
    toggleItem, openToggle, closeToggle,
    detailItem, openDetail, closeDetail
  } = usePublicacionModals();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [igQuickPublish, setIgQuickPublish] = useState<Publicacion | null>(null);

  const {
    selectedIds, bulkAction, setBulkAction,
    toggleSelect, toggleSelectAll, clearSelection, handleBulkStatus
  } = useBulkSelection(refresh, showNotification);

  const { withInternet, OfflineBlockedModalElement, isOnline } = useNetworkGuard();

  // ── Procesamiento de datos (NO hooks, seguro con null guards) ──
  const filtered = applyFilters(items, syncStatuses);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  // ── Hooks (deben correr SIEMPRE en el mismo orden) ──
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);



  // 🛡️ Early returns (solo JSX, después de TODOS los hooks)
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col items-center justify-center py-24 text-center bg-card/50 backdrop-blur border border-destructive/30 rounded-[3rem] shadow-sm">
          <div className="size-20 bg-destructive/10 rounded-[2rem] flex items-center justify-center mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-destructive mb-2">Error al cargar publicaciones</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-lg font-mono bg-muted/50 p-3 rounded-lg break-all">
            {error}
          </p>
          <Button onClick={refresh} variant="outline" className="rounded-xl px-6 h-12 shadow-md">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return <PublicacionesSkeleton />;

  // Reset page when filters change
  const handleFilterChange = (v: string) => {
    setFiltro(v as 'todos' | 'publicado_web' | 'publicado_ig' | 'borrador');
    setPage(1);
    clearSelection();
  };

  const handleCategoriaChange = (v: string) => {
    setCategoriaFiltro(v);
    setPage(1);
    clearSelection();
  };

  const handleSave = async (p: Publicacion, publishToIG?: boolean, _igImages?: string[], igMedia?: IgMedia[]) => {
    const saved = await withInternet('guardar propiedad', async () => {
      const result = await save(p, editItem?.id);
      if (publishToIG && result && result.estado === 'publicado') {
        await publishIG(result, igMedia);
      }
      return result;
    });

    if (saved === undefined) return;

    closeForm();
    if (publishToIG && saved && saved.estado === 'publicado') {
      showNotification('success', '¡Guardado y publicado en Instagram exitosamente!');
    } else {
      showNotification('success', 'Propiedad guardada correctamente');
    }
  };

  const handlePublishIG = (pub: Publicacion) => {
    console.log('[DEBUG IG] Abriendo modal quick publish para:', pub.id, pub.titulo);
    setIgQuickPublish(pub);
  };


  const handleIgPublishComplete = async (pub: Publicacion, igMedia: IgMedia[]) => {
    try {
      const result = await withInternet('publicar en Instagram', () => publishIG(pub, igMedia));
      if (result === undefined) throw new Error('Sin conexión a internet');
      showNotification('success', '¡Publicado en Instagram exitosamente!');
      return result;
    } catch (e: any) {
      showNotification('error', 'Error al publicar en Instagram: ' + (e.message || 'Error desconocido'));
      throw e;
    }
  };

  const handleStatusChange = async (pub: Publicacion, status: string) => {
    const backendMap: Record<string, 'draft' | 'published' | 'hidden'> = { publicado: 'published', oculto: 'hidden', borrador: 'draft' };
    const dbStatus = backendMap[status];
    if (!dbStatus) return;
    try {
      const { error } = await supabase.from('properties').update({ status: dbStatus }).eq('id', pub.id);
      if (error) throw error;
      await refresh();
      showNotification('success', 'Estado actualizado');
    } catch (e: any) {
      showNotification('error', e.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Offline status indicator */}
      {!isOnline && (
        <div className="flex justify-end -mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Sin conexión — modo solo lectura
          </span>
        </div>
      )}
      {/* Offline blocked modal (shown when trying to write without internet) */}
      {OfflineBlockedModalElement}
      <PublicationsToolbar
        search={search}
        onSearchChange={e => setSearch(e.target.value)}
        filtro={filtro}
        onFilterChange={handleFilterChange}
        sort={sort}
        onSortChange={setSort}
        categoria={categoriaFiltro}
        onCategoriaChange={handleCategoriaChange}
        view={view}
        onViewChange={setView}
        onNew={() => openForm()}
        selectedIds={selectedIds}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        onClearSelection={clearSelection}
      />

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 pb-4 overflow-x-auto no-scrollbar w-full">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
          >
            Anterior
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button type="button"
                key={p}
                onClick={() => setPage(p)}
                className={`size-8 shrink-0 rounded-lg text-xs font-semibold transition-all ${p === safePage ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 mt-2">
        <div className="flex gap-3 text-sm text-muted-foreground items-center">
          <span className="font-medium text-foreground">{filtered.length}</span> publicaciones &nbsp;·&nbsp;
          <span className="text-green-600 font-medium">{items.filter(p => p.estado === 'publicado').length} publicadas</span> &nbsp;·&nbsp;
          <span className="text-amber-600 font-medium">{items.filter(p => p.estado === 'borrador').length} borradores</span>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <PublicationsGridView
          paginated={paginated}
          syncStatuses={syncStatuses}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={pub => openForm(pub)}
          onDelete={pub => openDelete(pub)}
          onToggle={pub => openToggle(pub)}
          onStatusChange={handleStatusChange}
          onPublishIG={handlePublishIG}
          onToggleFeatured={toggleFeatured}
          onUnlinkIG={(pub) => unlinkIG(pub.id)}
        />
      )}

      {/* List View */}
      {view === 'list' && (
        <PublicationsListView
          paginated={paginated}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={pub => openForm(pub)}
          onDelete={pub => openDelete(pub)}
          onToggle={pub => openToggle(pub)}
          onDetail={pub => openDetail(pub)}
          onPublishIG={handlePublishIG}
          onToggleFeatured={toggleFeatured}
          syncStatuses={syncStatuses}
          onUnlinkIG={(pub) => unlinkIG(pub.id)}
        />
      )}

      {!loading && filtered.length === 0 && (
        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-card/50 backdrop-blur border border-dashed border-border/60 rounded-[3rem] shadow-sm mt-4">
          <div className="size-20 bg-muted/80 rounded-[2rem] flex items-center justify-center mb-5 rotate-12 transition-transform hover:rotate-0">
            <ImagePlus className="size-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">No hay publicaciones</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm leading-relaxed">
            Comienza a armar tu catálogo creando tu primera publicación inmobiliaria.
          </p>
          <Button onClick={() => openForm()} className="rounded-xl px-6 h-12 shadow-md">
            <Plus className="size-4 mr-2" /> Crear primera publicación
          </Button>
        </div>
      )}

      <Suspense fallback={null}>
        <PropertyFormModal open={isFormOpen} onClose={closeForm} initial={editItem} onSave={handleSave} igStatus={editItem ? syncStatuses[editItem.id] : null} />
      </Suspense>

      <ConfirmModal
        open={!!deleteItem}
        onClose={closeDelete}
        onConfirm={async () => {
          const result = await withInternet(`eliminar "${deleteItem?.titulo}"`, () => remove(deleteItem!.id));
          if (result === undefined) return; // Blocked by offline guard
          closeDelete();
          showNotification('success', 'Publicación eliminada');
        }}
        accion={`eliminar la publicación "${deleteItem?.titulo}"`}
        variant="danger"
      />

      <ConfirmModal
        open={!!toggleItem}
        onClose={closeToggle}
        onConfirm={async () => {
          const result = await withInternet(
            toggleItem?.estado === 'oculto' ? 'mostrar publicación' : 'ocultar publicación',
            () => toggle(toggleItem!)
          );
          if (result === undefined) return; // Blocked by offline guard
          closeToggle();
          showNotification('success', 'Estado cambiado');
        }}
        accion={toggleItem?.estado === 'oculto' ? `mostrar "${toggleItem?.titulo}"` : `ocultar "${toggleItem?.titulo}"`}
        titulo={toggleItem?.estado === 'oculto' ? '¿Mostrar esta publicación?' : '¿Ocultar esta publicación?'}
        confirmLabel={toggleItem?.estado === 'oculto' ? 'Sí, mostrar' : 'Sí, ocultar'}
        variant="warning"
      />

      <ConfirmModal
        open={!!bulkAction}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkStatus}
        accion={
          bulkAction === 'publicar' ? `publicar ${selectedIds.size} publicacion${selectedIds.size === 1 ? '' : 'es'}` :
          bulkAction === 'ocultar' ? `ocultar ${selectedIds.size} publicacion${selectedIds.size === 1 ? '' : 'es'}` :
          bulkAction === 'borrador' ? `mover ${selectedIds.size} publicacion${selectedIds.size === 1 ? '' : 'es'} a borrador` : ''
        }
        titulo={
          bulkAction === 'publicar' ? '¿Publicar seleccionadas?' :
          bulkAction === 'ocultar' ? '¿Ocultar seleccionadas?' :
          bulkAction === 'borrador' ? '¿Mover a borrador?' : ''
        }
        confirmLabel={
          bulkAction === 'publicar' ? 'Sí, publicar' :
          bulkAction === 'ocultar' ? 'Sí, ocultar' : 'Sí, mover'
        }
        variant="warning"
      />

      <Suspense fallback={null}>
        <IgQuickPublishModal
          open={!!igQuickPublish}
          onClose={() => setIgQuickPublish(null)}
          publicacion={igQuickPublish}
          igStatus={igQuickPublish ? syncStatuses[igQuickPublish.id] : null}
          onPublish={handleIgPublishComplete}
        />
      </Suspense>

      <PublicationDetailDialog
        open={!!detailItem}
        pub={detailItem}
        onClose={closeDetail}
        onEdit={() => { closeDetail(); openForm(detailItem!); }}
        onToggle={() => { closeDetail(); openToggle(detailItem!); }}
        onDelete={() => { closeDetail(); openDelete(detailItem!); }}
        onPublishIG={detailItem?.estado === 'publicado' ? async () => { await handlePublishIG(detailItem); closeDetail(); } : undefined}
        igAvailable={igAvailable}
      />
    </div>
  );
}
