import React from 'react';
import type { AppUser } from '../../types';
import ChatComponent from '../Chat';

interface ChatTabProps {
    user: AppUser | null;
    discoveryId: string;
}

export const ChatTab: React.FC<ChatTabProps> = ({ user, discoveryId }) => {
    if (!user) {
        return (
            <div className="p-6 text-center text-slate-400">
                Please sign in to use the chat feature.
            </div>
        );
    }

    if (!discoveryId) {
        return (
            <div className="p-6 text-center text-slate-400">
                Discovery ID not available. Please try uploading an image again.
            </div>
        );
    }

    return <ChatComponent user={user} discoveryId={discoveryId} />;
};