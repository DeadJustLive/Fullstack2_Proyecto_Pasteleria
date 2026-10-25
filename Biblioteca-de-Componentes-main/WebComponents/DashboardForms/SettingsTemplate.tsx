// @use(kind, props, limit, deps, state)
// @kind(component)
// @props(uiRole, handleLogout, handleLockToStaff, handleUnlockToAdmin, ...)
// @limit(lines: 405, functions: 3, params: 1) // TODO: refactor >250 lines
// @deps(@external: [react, lucide-react, sonner], @internal: [../lib/supabase, ./ChangePasswordModal, ./DeliveryZones, ./AboutModal])
import { useState } from 'react';
import { Bell, User, Shield, HelpCircle, LogOut, ChevronRight, Database, MapPin, Pencil, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { DeliveryZones } from './DeliveryZones';
import { UserManagement } from './UserManagement';
import { AboutModal } from './AboutModal';
import { PinPadModal } from './PinPadModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ReviewModeration } from './ReviewModeration';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  onLogout?: () => void;
  uiRole: string;
  backendRole: string;
  user?: any | null;
  onLockToStaff: () => void;
  onUnlockToAdmin: () => void;
  onSubPageChange?: (isSubPage: boolean) => void;
}

export function Settings({ onLogout, uiRole, backendRole, user, onLockToStaff, onUnlockToAdmin, onSubPageChange }: SettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showZones, setShowZones] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Pin Lock state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<'setup' | 'verify'>('setup');


  // Auth modals
  const [showChangePassword, setShowChangePassword] = useState(false);

  // User profile edit state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.user_metadata?.name || user?.user_metadata?.full_name || '');
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = async () => {
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { name: nameValue } });
    setSavingName(false);
    if (error) {
      toast.error('Error al guardar nombre');
    } else {
      setEditingName(false);
      toast.success('Nombre actualizado');
    }
  };

  type SettingItem =
    | { type: 'switch'; label: string; description?: string; value: boolean; onChange: (v: boolean) => void }
    | { type: 'link'; label: string; description?: string; onClick: () => void };

  const settingSections: { title: string; icon: any; items: SettingItem[] }[] = [
    {
      title: 'Notificaciones',
      icon: Bell,
      items: [
        {
          label: 'Notificaciones Push',
          description: 'Recibe alertas de nuevos pedidos',
          type: 'switch',
          value: notificationsEnabled,
          onChange: setNotificationsEnabled,
        },
        {
          label: 'Notificaciones por Email',
          description: 'Recibe resúmenes diarios por correo',
          type: 'switch',
          value: emailNotifications,
          onChange: setEmailNotifications,
        },
        {
          label: 'Sonidos',
          description: 'Reproducir sonidos de alerta',
          type: 'switch',
          value: soundEnabled,
          onChange: setSoundEnabled,
        },
      ],
    },
    {
      title: 'Cuenta',
      icon: User,
      items: [
        {
          label: 'Gestión de Personal',
          description: 'Añade y remueve empleados',
          type: 'link',
          onClick: () => { setShowUsers(true); onSubPageChange?.(true); },
        },
        {
          label: 'Cambiar Contraseña',
          description: 'Actualiza la contraseña de tu cuenta',
          type: 'link',
          onClick: () => setShowChangePassword(true),
        },
      ],
    },
    {
      title: 'Seguridad',
      icon: Shield,
      items: [
        {
          label: 'Autenticación de Dos Factores',
          description: 'Protege tu cuenta con una app autenticadora',
          type: 'link',
          onClick: () => toast.info('Función próximamente'),
        },
        {
          label: 'Sesiones Activas',
          description: 'Gestiona tus dispositivos conectados',
          type: 'link',
          onClick: () => toast.info('Función próximamente'),
        },
      ],
    },
    {
      title: 'Envíos',
      icon: MapPin,
      items: [
        {
          label: 'Zonas de Reparto',
          description: 'Habilita comunas para despacho',
          type: 'link',
          onClick: () => { setShowZones(true); onSubPageChange?.(true); },
        },
      ],
    },
    {
      title: 'Comunidad',
      icon: MessageSquare,
      items: [
        {
          label: 'Moderación de Reseñas',
          description: 'Aprueba o rechaza opiniones de clientes',
          type: 'link',
          onClick: () => { setShowReviews(true); onSubPageChange?.(true); },
        },
      ],
    },
    {
      title: 'Soporte',
      icon: HelpCircle,
      items: [
        {
          label: 'Centro de Ayuda',
          type: 'link',
          onClick: () => toast.info('Función próximamente'),
        },
        {
          label: 'Contactar Soporte',
          type: 'link',
          onClick: () => toast.info('Función próximamente'),
        },
        {
          label: 'Acerca de',
          description: 'Admin App v1.0.0',
          type: 'link',
          onClick: () => setShowAbout(true),
        },
      ],
    }
  ];

  // Add Shared Device Context if they are an actual admin in the DB
  if (backendRole === 'admin') {
    settingSections.splice(settingSections.length - 1, 0, {
      title: 'Dispositivo Compartido',
      icon: Shield,
      items: [
        {
          label: uiRole === 'admin' ? 'Bloquear App en Modo Staff' : 'Desbloquear Modo Admin',
          description: uiRole === 'admin' ? 'Ocultar funciones críticas con PIN' : 'Reingresar PIN para administrar',
          type: 'link',
          onClick: () => {
            const existingPin = localStorage.getItem('device_admin_pin');
            if (uiRole === 'admin') {
              // Locking to staff
              if (!existingPin) {
                setPinMode('setup');
                setShowPinModal(true);
              } else {
                // Fast lock
                localStorage.setItem('device_locked_staff', 'true');
                onLockToStaff();
                toast.success('Dispositivo bloqueado en modo Cajero');
              }
            } else {
              // Unlocking to admin
              setPinMode('verify');
              setShowPinModal(true);
            }
          }
        },
        // Optional: Let them clear the pin
        ...(localStorage.getItem('device_admin_pin') && uiRole === 'admin' ? [{
          label: 'Borrar PIN de Acceso',
          description: 'Quitar la clave de bloqueo de este dispositivo',
          type: 'link' as const,
          onClick: () => {
            localStorage.removeItem('device_admin_pin');
            localStorage.removeItem('device_locked_staff');
            toast.success('PIN borrado exitosamente');
          }
        }] : [])
      ]
    });
  }

  // Filter out admin-only sections if role is not admin
  const visibleSections = settingSections.filter(section => {
    if (uiRole === 'admin') return true;
    // Staff only sees 'Cuenta', 'Soporte', and 'Dispositivo Compartido'
    return section.title === 'Cuenta' || section.title === 'Soporte' || section.title === 'Dispositivo Compartido';
  });

  const handlePinSuccess = async (pin: string) => {
    if (pinMode === 'setup') {
      localStorage.setItem('device_admin_pin', pin);
      localStorage.setItem('device_locked_staff', 'true');
      setShowPinModal(false);
      onLockToStaff();
      toast.success('PIN configurado. Modo Cajero activado.');
    } else if (pinMode === 'verify') {
      const savedPin = localStorage.getItem('device_admin_pin');
      setShowPinModal(false);
      if (pin === savedPin) {
        localStorage.removeItem('device_locked_staff');
        onUnlockToAdmin();
        toast.success('Modo Administrador Restaurado');
      } else {
        toast.error('Ocurrió un error inesperado con el PIN'); // Handled by Modal mostly
      }
    }
  };

  if (showZones) {
    return <DeliveryZones onBack={() => { setShowZones(false); onSubPageChange?.(false); }} />;
  }

  if (showUsers) {
    return <UserManagement onBack={() => { setShowUsers(false); onSubPageChange?.(false); }} />;
  }

  if (showReviews) {
    return <ReviewModeration onBack={() => { setShowReviews(false); onSubPageChange?.(false); }} />;
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header" style={{ paddingTop: 'max(var(--sat, 0px), 0.5rem)' }}>
        <div className="settings-header-inner">
          <h1 className="settings-title">Configuración</h1>
          <p className="settings-subtitle">Ajustes y preferencias</p>
        </div>
      </div>

      <div className="settings-content">
        {/* User Profile Card */}
        {user && (
          <div className="settings-profile-card">
            <div className="settings-profile-header">
              <div className="settings-profile-avatar">
                <User className="settings-profile-icon" />
              </div>
              <div className="settings-profile-info">
                {editingName ? (
                  <div className="settings-profile-name-row">
                    <input
                      autoFocus
                      type="text"
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                      className="settings-profile-input"
                    />
                    <button onClick={handleSaveName} disabled={savingName} className="settings-profile-save-btn">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingName(false)} className="settings-profile-cancel-btn">
                      <X className="w-4 h-4 text-brand-text/60" />
                    </button>
                  </div>
                ) : (
                  <div className="settings-profile-name-row">
                    <span className="settings-profile-name">
                      {nameValue || 'Sin nombre'}
                    </span>
                    <button onClick={() => setEditingName(true)} className="settings-profile-edit-btn">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <p className="settings-profile-email">{user.email}</p>
              </div>
            </div>
            <div className="settings-profile-role">
              {backendRole === 'admin' ? 'Administrador' : 'Personal'}
            </div>
          </div>
        )}

        {visibleSections.map((section) => (
          <div key={section.title} className="settings-section">
            <div className="settings-section-header">
              <section.icon className="settings-section-icon" />
              <h2 className="settings-section-title">{section.title}</h2>
            </div>

            <div className="settings-section-card">
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className={`settings-item ${index < section.items.length - 1 ? 'settings-item--border' : ''}`}
                >
                  {item.type === 'switch' && (
                    <div className="settings-switch-row">
                      <div className="settings-item-info">
                        <div className="settings-item-title">{item.label}</div>
                        {item.description && (
                          <div className="settings-item-desc">{item.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => item.onChange(!item.value)}
                        className={`settings-switch ${item.value ? 'settings-switch--on' : 'settings-switch--off'}`}
                      >
                        <div
                          className={`settings-switch-thumb ${item.value ? 'settings-switch-thumb--on' : 'settings-switch-thumb--off'}`}
                        />
                      </button>
                    </div>
                  )}

                  {item.type === 'link' && (
                    <button
                      onClick={item.onClick}
                      className="settings-link-row"
                    >
                      <div className="settings-link-info">
                        <div className="settings-link-title">{item.label}</div>
                        {item.description && (
                          <div className="settings-link-desc">{item.description}</div>
                        )}
                      </div>
                      <ChevronRight className="settings-link-chevron" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}


        {uiRole === 'admin' && (
          <button
            onClick={() => toast.info('Función próximamente')}
            className="settings-btn-demo"
          >
            <Database className="w-5 h-5" />
            Datos de Prueba
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={() => {
            if (onLogout) onLogout();
            else toast.info('Función próximamente');
          }}
          className="settings-btn-logout"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>

      {/* Modals */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <PinPadModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        mode={pinMode}
        onSuccess={handlePinSuccess}
      />
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userEmail={user?.email}
      />
    </div >
  );
}