import {
    Box,
    CircularProgress,
    Container,
    Divider,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
  } from "@mui/material";
  
  import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
  
  import { useEffect, useMemo, useRef, useState } from "react";
  
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  
  import { useSearchParams } from "react-router-dom";
  
  import {
    getConversations,
    getMessages,
    markConversationRead,
    sendMessage,
  } from "../features/messages/api/messagesApi";
  
  import ConversationItem from "../features/messages/components/ConversationItem";
  
  import MessageBubble from "../features/messages/components/MessageBubble";
  
  import MessageComposer from "../features/messages/components/MessageComposer";
  
  import ChatHeader from "../features/messages/components/ChatHeader";
  
  import { useAuthStore } from "../features/auth/store/authStore";
  
  export default function MessagesPage() {
    const queryClient = useQueryClient();
  
    const currentUser = useAuthStore((state) => state.user);
  
    const [searchParams, setSearchParams] = useSearchParams();
  
    const conversationFromUrl = searchParams.get("conversation");
  
    const [selectedId, setSelectedId] = useState(null);
  
    const [search, setSearch] = useState("");
  
    const bottomRef = useRef(null);
  
    const conversationsQuery = useQuery({
      queryKey: ["conversations"],
  
      queryFn: getConversations,
    });
  
    function handleConversationSelect(conversationId) {
      setSelectedId(conversationId);
  
      setSearchParams({
        conversation: conversationId,
      });
    }
  
    useEffect(() => {
      if (conversationFromUrl) {
        setSelectedId(conversationFromUrl);
  
        return;
      }
  
      if (!selectedId && conversationsQuery.data?.length) {
        setSelectedId(conversationsQuery.data[0].id);
      }
    }, [conversationFromUrl, selectedId, conversationsQuery.data]);
  
    const selectedConversation = conversationsQuery.data?.find(
      (conversation) => conversation.id === selectedId
    );
  
    const messagesQuery = useQuery({
      queryKey: ["messages", selectedId],
  
      queryFn: () => getMessages(selectedId, 1, 100),
  
      enabled: Boolean(selectedId),
    });
  
    const sendMutation = useMutation({
      mutationFn: (content) => sendMessage(selectedId, content),
  
      onSuccess: (message) => {
        queryClient.setQueryData(["messages", selectedId], (old) => {
          if (!old) {
            return {
              items: [message],
  
              totalCount: 1,
            };
          }
  
          if (old.items?.some((item) => item.id === message.id)) {
            return old;
          }
  
          return {
            ...old,
  
            items: [...(old.items ?? []), message],
  
            totalCount: (old.totalCount ?? 0) + 1,
          };
        });
  
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
        });
      },
    });
  
    useEffect(() => {
      if (!selectedId) {
        return;
      }
  
      markConversationRead(selectedId)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: ["conversations"],
          });
  
          queryClient.invalidateQueries({
            queryKey: ["message-unread-count"],
          });
        })
        .catch(console.error);
    }, [selectedId, messagesQuery.data?.items?.length, queryClient]);
  
    useEffect(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, [messagesQuery.data?.items?.length]);
  
    const filteredConversations = useMemo(() => {
      const items = conversationsQuery.data ?? [];
  
      const term = search.trim().toLowerCase();
  
      if (!term) {
        return items;
      }
  
      return items.filter((conversation) =>
        `${conversation.firstName} ${conversation.lastName} ${conversation.userName}`
          .toLowerCase()
          .includes(term)
      );
    }, [conversationsQuery.data, search]);
  
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            height: "calc(100vh - 110px)",
  
            minHeight: 600,
  
            overflow: "hidden",
  
            display: "grid",
  
            gridTemplateColumns: {
              xs: "1fr",
  
              md: "340px minmax(0,1fr)",
            },
  
            borderRadius: 5,
  
            border: "1px solid rgba(148,163,184,.16)",
  
            boxShadow: "0 22px 70px rgba(15,23,42,.08)",
  
            bgcolor: "white",
          }}
        >
          {/* LEFT */}
  
          <Box
            sx={{
              display: {
                xs: selectedId ? "none" : "flex",
  
                md: "flex",
              },
  
              flexDirection: "column",
  
              borderRight: "1px solid rgba(148,163,184,.16)",
  
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                p: 2.2,
              }}
            >
              <Typography variant="h5" fontWeight={950}>
                Messages
              </Typography>
  
              <Typography variant="body2" color="text.secondary" mb={2}>
                Chat with your friends
              </Typography>
  
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
  
                    bgcolor: "#f6f8fc",
                  },
                }}
              />
            </Box>
  
            <Divider />
  
            <Stack
              sx={{
                p: 1.3,
  
                overflowY: "auto",
  
                flex: 1,
              }}
            >
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  selected={selectedId === conversation.id}
                  onClick={() => {
                    handleConversationSelect(conversation.id);
  
  
                  }}
                />
              ))}
  
              {!conversationsQuery.isLoading &&
                filteredConversations.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{
                      mt: 4,
                    }}
                  >
                    No conversations yet.
                  </Typography>
                )}
            </Stack>
          </Box>
  
          {/* RIGHT CHAT */}
  
          <Box
            sx={{
              display: {
                xs: selectedId ? "flex" : "none",
  
                md: "flex",
              },
  
              flexDirection: "column",
  
              minWidth: 0,
  
              minHeight: 0,
            }}
          >
            {!selectedConversation ? (
              <Box
                sx={{
                  flex: 1,
  
                  display: "grid",
  
                  placeItems: "center",
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={850}>
                    Select a conversation
                  </Typography>
  
                  <Typography color="text.secondary">
                    Choose a friend to start messaging.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <>
                <ChatHeader
                  conversation={selectedConversation}
                  onBack={() => setSelectedId(null)}
                />
  
                <Box
                  sx={{
                    flex: 1,
  
                    overflowY: "auto",
  
                    p: {
                      xs: 2,
                      md: 3,
                    },
  
                    bgcolor: "#f8fafc",
  
                    backgroundImage:
                      "radial-gradient(circle at 10% 10%,rgba(37,99,235,.035),transparent 30%),radial-gradient(circle at 90% 90%,rgba(124,58,237,.035),transparent 30%)",
                  }}
                >
                  {messagesQuery.isLoading ? (
                    <Box
                      sx={{
                        height: "100%",
  
                        display: "grid",
  
                        placeItems: "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {messagesQuery.data?.items?.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          mine={message.senderId === currentUser?.userId}
                        />
                      ))}
  
                      <div ref={bottomRef} />
                    </>
                  )}
                </Box>
  
                <MessageComposer
                  disabled={sendMutation.isPending}
                  onSend={(content) => sendMutation.mutate(content)}
                />
              </>
            )}
          </Box>
        </Paper>
      </Container>
    );
  }