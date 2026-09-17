"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Fab from "@mui/material/Fab";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useSendChatMessage, useChatSessionMessages } from "@/lib/api/chat";
import { cartKeys } from "@/lib/api/cart";
import { AUTH_CHANGED_EVENT, isLoggedIn } from "@/lib/auth/token";
import { getStoredChatSessionId, setStoredChatSessionId } from "@/lib/chat/session";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { IChatBubble, IChatProductRef } from "@/interfaces/Chat";

const MESSAGES_DISPLAY_LIMIT = 10;

let bubbleIdCounter = 0;
const nextBubbleId = () => `bubble-${++bubbleIdCounter}`;

export function ChatWidget() {
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatSessionId, setChatSessionId] = useState<number | null>(null);
  // The session id loaded from localStorage on mount, kept stable for the
  // lifetime of the widget so sending a new message (which updates
  // chatSessionId) never re-triggers a history refetch that would duplicate
  // the bubbles we already track locally.
  const [initialSessionId, setInitialSessionId] = useState<number | null>(null);
  const [localBubbles, setLocalBubbles] = useState<IChatBubble[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const sendMessage = useSendChatMessage();
  const { data: history, isFetched: historyFetched } = useChatSessionMessages(
    open ? initialSessionId : null,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, unavailable during SSR
    setLoggedIn(isLoggedIn());
    const storedSessionId = getStoredChatSessionId();
    setChatSessionId(storedSessionId);
    setInitialSessionId(storedSessionId);

    const handleAuthChange = () => setLoggedIn(isLoggedIn());
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [localBubbles]);

  useEffect(() => {
    // Auto-scroll to bottom when chat first opens
    if (open) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" });
      }, 0);
    }
  }, [open]);

  // Messages already persisted on the server (loaded once per session) plus
  // any bubbles created locally during this render (new user/assistant
  // turns), concatenated for display — no effect/setState needed to merge them.
  const historyBubbles = useMemo<IChatBubble[]>(() => {
    if (history == null) return [];
    return history.messages
      .filter((message) => message.chatMessageRole !== "system")
      .map((message) => ({
        id: `history-${message.chatMessageId}`,
        role: message.chatMessageRole as "user" | "assistant",
        content: message.chatMessageContent,
      }));
  }, [history]);

  const bubbles = useMemo(
    () => [...historyBubbles, ...localBubbles],
    [historyBubbles, localBubbles],
  );

  const showWelcome =
    bubbles.length === 0 && (initialSessionId == null || historyFetched);

  function handleToggle() {
    setOpen((prev) => !prev);
  }

  function handleSend() {
    const trimmed = input.trim();
    if (trimmed.length === 0 || sendMessage.isPending) return;

    const userBubble: IChatBubble = { id: nextBubbleId(), role: "user", content: trimmed };
    setLocalBubbles((prev) => [...prev, userBubble]);
    setInput("");

    sendMessage.mutate(
      { chatSessionId: chatSessionId ?? undefined, message: trimmed },
      {
        onSuccess: (data) => {
          setChatSessionId(data.chatSessionId);
          setStoredChatSessionId(data.chatSessionId);
          setLocalBubbles((prev) => [
            ...prev,
            {
              id: nextBubbleId(),
              role: "assistant",
              content: data.reply,
              products: data.products,
            },
          ]);
          // The assistant may have called add_to_cart on the server; refresh
          // the header badge/cart page in case it did (cheap no-op otherwise).
          queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
        onError: () => {
          setLocalBubbles((prev) => [
            ...prev,
            { id: nextBubbleId(), role: "assistant", content: t("chat.error") },
          ]);
        },
      },
    );
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <Fab
        color="primary"
        aria-label={t("chat.openButton")}
        onClick={handleToggle}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: (theme) => theme.zIndex.drawer + 2 }}
      >
        {open ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
      </Fab>

      {open && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 96,
            right: 24,
            width: { xs: "calc(100vw - 32px)", sm: 360 },
            height: 480,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            zIndex: (theme) => theme.zIndex.drawer + 2,
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: "primary.main", color: "primary.contrastText" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t("chat.title")}
            </Typography>
          </Box>

          {!loggedIn ? (
            <Stack
              spacing={2}
              sx={{ flex: 1, p: 3, alignItems: "center", justifyContent: "center", textAlign: "center" }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("chat.loginRequired")}
              </Typography>
              <Button component={Link} href="/login" variant="contained" size="small">
                {t("nav.login")}
              </Button>
            </Stack>
          ) : (
            <>
              <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                <Stack spacing={1.5}>
                  {showWelcome && bubbles.length === 0 && (
                    <ChatBubbleView bubble={{ id: "welcome", role: "assistant", content: t("chat.welcome") }} />
                  )}
                  {bubbles.slice(-MESSAGES_DISPLAY_LIMIT).map((bubble) => (
                    <ChatBubbleView key={bubble.id} bubble={bubble} />
                  ))}
                  {sendMessage.isPending && (
                    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                      <CircularProgress size={18} />
                    </Box>
                  )}
                </Stack>
              </Box>

              <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("chat.placeholder")}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendMessage.isPending}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={sendMessage.isPending || input.trim().length === 0}
                  aria-label={t("chat.send")}
                >
                  <ChatBubbleOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            </>
          )}
        </Paper>
      )}
    </>
  );
}

function ChatBubbleView({ bubble }: { bubble: IChatBubble }) {
  const { t } = useTranslation();
  const isUser = bubble.role === "user";

  return (
    <Box sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <Stack sx={{ maxWidth: "85%", alignItems: isUser ? "flex-end" : "flex-start" }} spacing={0.75}>
        <Paper
          variant={isUser ? "elevation" : "outlined"}
          elevation={isUser ? 2 : 0}
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: isUser ? "primary.main" : "background.paper",
            color: isUser ? "primary.contrastText" : "text.primary",
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {bubble.content}
          </Typography>
        </Paper>

        {bubble.products != null && bubble.products.length > 0 && (
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
            {bubble.products.slice(0, 5).map((product: IChatProductRef) => (
              <Chip
                key={product.productId}
                component={Link}
                href={`/products/${product.productId}`}
                clickable
                size="small"
                label={`${product.productName} · ${formatCurrency(product.productPrice)}`}
                title={t("chat.viewProduct")}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
