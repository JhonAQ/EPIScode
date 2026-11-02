"use client";

import { useEffect, useState } from "react";
import { CHAT_INVITATIONS } from "../constants/chat-invitations";

/** Selecciona una frase al entrar; abrir o cerrar el chat no vuelve a elegirla. */
export function useChatInvitation() {
  const [invitation, setInvitation] = useState<string | null>(null);

  useEffect(() => {
    // Elegir en el cliente evita diferencias entre el HTML del servidor y React.
    const frame = requestAnimationFrame(() => {
      const index = Math.floor(Math.random() * CHAT_INVITATIONS.length);
      setInvitation(CHAT_INVITATIONS[index]);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return invitation;
}
