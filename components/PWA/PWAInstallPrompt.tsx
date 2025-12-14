import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Share, MoreVertical, Plus, ArrowDown, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

const PWAInstallPrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [platform, setPlatform] = useState<Platform>('unknown');
    const [showManualInstructions, setShowManualInstructions] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    // Detect platform
    const detectPlatform = (): Platform => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /android/.test(userAgent);

        if (isIOS) return 'ios';
        if (isAndroid) return 'android';
        return 'desktop';
    };

    // Check if already installed
    const checkIfInstalled = (): boolean => {
        // Check display-mode
        if (window.matchMedia('(display-mode: standalone)').matches) return true;
        // iOS Safari
        if ((window.navigator as any).standalone === true) return true;
        // Check localStorage
        if (localStorage.getItem('pwa-installed') === 'true') return true;
        return false;
    };

    useEffect(() => {
        console.log('[PWA] Initializing PWA Install Prompt...');

        const detectedPlatform = detectPlatform();
        setPlatform(detectedPlatform);
        console.log('[PWA] Detected platform:', detectedPlatform);

        const installed = checkIfInstalled();
        setIsInstalled(installed);
        console.log('[PWA] Is installed:', installed);

        if (installed) {
            console.log('[PWA] App already installed, not showing prompt');
            return;
        }

        // Check if user dismissed before (only hide for 24 hours)
        const dismissedAt = localStorage.getItem('pwa-dismissed-at');
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt);
            const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
            if (hoursSinceDismissed < 24) {
                console.log('[PWA] User dismissed within 24h, not showing prompt');
                return;
            }
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
            console.log('[PWA] beforeinstallprompt event fired!');
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Show prompt after 2 seconds
        const timer = setTimeout(() => {
            console.log('[PWA] Timer fired, showing prompt...');
            setShowPrompt(true);
        }, 2000);

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully!');
            setIsInstalled(true);
            setShowPrompt(false);
            localStorage.setItem('pwa-installed', 'true');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            clearTimeout(timer);
        };
    }, []);

    const handleInstallClick = async () => {
        console.log('[PWA] Install button clicked');
        console.log('[PWA] Deferred prompt available:', !!deferredPrompt);

        if (deferredPrompt) {
            try {
                console.log('[PWA] Triggering native install prompt...');
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('[PWA] User choice:', outcome);

                if (outcome === 'accepted') {
                    setIsInstalled(true);
                    setShowPrompt(false);
                    localStorage.setItem('pwa-installed', 'true');
                }
            } catch (error) {
                console.error('[PWA] Install error:', error);
                setShowManualInstructions(true);
            }
            setDeferredPrompt(null);
        } else {
            console.log('[PWA] No deferred prompt, showing manual instructions');
            setShowManualInstructions(true);
        }
    };

    const handleDismiss = () => {
        console.log('[PWA] Prompt dismissed by user');
        setShowPrompt(false);
        setShowManualInstructions(false);
        localStorage.setItem('pwa-dismissed-at', Date.now().toString());
    };

    if (!showPrompt || isInstalled) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 w-full sm:w-auto sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-6 sm:p-8 text-white">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-2 shadow-lg">
                            <img
                                src="/logo_bahia.jpg"
                                alt="Bahia Elétrica"
                                className="w-full h-full object-contain rounded-xl"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold">Bahia Elétrica</h2>
                            <p className="text-brand-200 text-sm">Sistema de Gestão</p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-brand-100 text-sm">
                        <Zap className="w-4 h-4 text-accent-500" />
                        <span>Instale para acesso rápido e offline!</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                    {!showManualInstructions ? (
                        <>
                            {/* Benefits */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Download className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span>Acesse sem abrir o navegador</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Smartphone className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span>Funciona como app nativo</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Monitor className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span>Notificações e acesso offline</span>
                                </div>
                            </div>

                            {/* Install Button */}
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-brand-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Instalar Agora
                            </button>

                            <button
                                onClick={handleDismiss}
                                className="w-full mt-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm py-2 transition-colors"
                            >
                                Agora não
                            </button>
                        </>
                    ) : (
                        /* Manual Instructions */
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                                Como instalar manualmente
                            </h3>

                            {platform === 'ios' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-brand-600 font-bold">1</div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Toque no botão compartilhar</p>
                                                <p className="text-xs text-gray-500 mt-1">Na barra inferior do Safari</p>
                                                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-lg p-2 inline-flex">
                                                    <Share className="w-5 h-5 text-brand-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-brand-600 font-bold">2</div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Selecione "Adicionar à Tela de Início"</p>
                                                <p className="text-xs text-gray-500 mt-1">Role para baixo se necessário</p>
                                                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-lg p-2 inline-flex items-center gap-2 text-sm">
                                                    <Plus className="w-4 h-4 text-brand-600" />
                                                    <span className="text-gray-700 dark:text-gray-200">Adicionar à Tela</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {platform === 'android' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-brand-600 font-bold">1</div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Toque no menu ⋮</p>
                                                <p className="text-xs text-gray-500 mt-1">No canto superior direito do Chrome</p>
                                                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-lg p-2 inline-flex">
                                                    <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-brand-600 font-bold">2</div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Selecione "Instalar app" ou "Adicionar à tela inicial"</p>
                                                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-lg p-2 inline-flex items-center gap-2 text-sm">
                                                    <Download className="w-4 h-4 text-brand-600" />
                                                    <span className="text-gray-700 dark:text-gray-200">Instalar app</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {platform === 'desktop' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-brand-600 font-bold">1</div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Procure o ícone de instalação</p>
                                                <p className="text-xs text-gray-500 mt-1">Na barra de endereço do navegador</p>
                                                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-lg p-2 inline-flex items-center gap-2">
                                                    <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                                                    <ArrowDown className="w-4 h-4 text-brand-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-brand-600 font-bold">2</div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Clique em "Instalar"</p>
                                                <p className="text-xs text-gray-500 mt-1">Confirme a instalação do aplicativo</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowManualInstructions(false)}
                                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-xl transition-colors"
                            >
                                Voltar
                            </button>

                            <button
                                onClick={handleDismiss}
                                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm py-2 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>

                {/* Safe area for iOS devices */}
                <div className="h-safe-area-inset-bottom bg-white dark:bg-gray-800" />
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
