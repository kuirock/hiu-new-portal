import { createPortal } from 'react-dom';
import { useEffect, useState, type ReactNode } from 'react';

interface PortalProps {
    children: ReactNode;
}

export const Portal = ({ children }: PortalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // マウントされるまでは何も表示しない（SSR対策）
    if (!mounted) return null;

    // document.body に直接ワープさせる！
    return createPortal(children, document.body);
};