import {
    Avatar,
    Box,
    Divider,
    IconButton,
    Paper,
    Typography,
  } from "@mui/material";
  
  import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
  import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
  import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
  import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
  import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
  import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
  
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  
  import { likePost, unlikePost } from "../api/postsApi";
  
  import { API_ORIGIN } from "../../../config";
  
  import { useState } from "react";
  import CommentSection from "../../comments/components/CommentSection";
  
  export default function PostCard({ post }) {
    const [showComments, setShowComments] = useState(false);
    const queryClient = useQueryClient();
  
    const imageUrl = post.imageUrl ? `${API_ORIGIN}${post.imageUrl}` : null;
  
    const videoUrl = post.videoUrl ? `${API_ORIGIN}${post.videoUrl}` : null;
  
    const profileImageUrl = post.profileImageUrl
      ? post.profileImageUrl.startsWith("http")
        ? post.profileImageUrl
        : `${API_ORIGIN}${post.profileImageUrl}`
      : null;
  
    const likeMutation = useMutation({
      mutationFn: () =>
        post.isLikedByCurrentUser ? unlikePost(post.id) : likePost(post.id),
  
      onMutate: async () => {
        await queryClient.cancelQueries({
          queryKey: ["posts"],
        });
  
        const previousData = queryClient.getQueryData(["posts"]);
  
        queryClient.setQueryData(["posts"], (oldData) => {
          if (!oldData) {
            return oldData;
          }
  
          return {
            ...oldData,
  
            items: oldData.items.map((item) => {
              if (item.id !== post.id) {
                return item;
              }
  
              const currentlyLiked = item.isLikedByCurrentUser;
  
              return {
                ...item,
  
                isLikedByCurrentUser: !currentlyLiked,
  
                likeCount: item.likeCount + (currentlyLiked ? -1 : 1),
              };
            }),
          };
        });
  
        return {
          previousData,
        };
      },
  
      onError: (_error, _variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(["posts"], context.previousData);
        }
      },
  
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["posts"],
        });
      },
    });
  
    function handleLike() {
      if (likeMutation.isPending) {
        return;
      }
  
      likeMutation.mutate();
    }
  
    function formatPostDate(date) {
      if (!date) {
        return "";
      }
  
      const postDate = new Date(date);
  
      const now = new Date();
  
      const difference = now.getTime() - postDate.getTime();
  
      const seconds = Math.floor(difference / 1000);
  
      const minutes = Math.floor(seconds / 60);
  
      const hours = Math.floor(minutes / 60);
  
      const days = Math.floor(hours / 24);
  
      if (seconds < 60) {
        return "Just now";
      }
  
      if (minutes < 60) {
        return `${minutes}m`;
      }
  
      if (hours < 24) {
        return `${hours}h`;
      }
  
      if (days < 7) {
        return `${days}d`;
      }
  
      return postDate.toLocaleDateString();
    }
  
    return (
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
  
          borderRadius: 4,
  
          border: "1px solid",
  
          borderColor: "rgba(148,163,184,.18)",
  
          background: "rgba(255,255,255,.96)",
  
          boxShadow: "0 16px 45px rgba(15,23,42,.065)",
  
          transition: "transform .2s ease, box-shadow .2s ease",
  
          "&:hover": {
            boxShadow: "0 20px 55px rgba(15,23,42,.09)",
          },
        }}
      >
        {/* =========================
            POST HEADER
        ========================= */}
  
        <Box
          sx={{
            px: 2.5,
            pt: 2.3,
            pb: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Avatar
              src={profileImageUrl || undefined}
              sx={{
                width: 48,
                height: 48,
  
                mr: 1.5,
  
                fontWeight: 800,
  
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
  
                boxShadow: "0 7px 18px rgba(37,99,235,.18)",
              }}
            >
              {post.firstName?.[0]}
            </Avatar>
  
            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.25,
                  fontSize: 15.5,
                }}
              >
                {post.firstName} {post.lastName}
              </Typography>
  
              <Box
                sx={{
                  mt: 0.3,
  
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {formatPostDate(post.createdAt)}
                </Typography>
  
                <Typography variant="caption" color="text.secondary">
                  •
                </Typography>
  
                <PublicRoundedIcon
                  sx={{
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                />
              </Box>
            </Box>
  
            <IconButton
              sx={{
                "&:hover": {
                  bgcolor: "rgba(15,23,42,.05)",
                },
              }}
            >
              <MoreHorizRoundedIcon />
            </IconButton>
          </Box>
  
          {/* =========================
              TEXT
          ========================= */}
  
          {post.content && (
            <Typography
              sx={{
                mt: 2,
  
                whiteSpace: "pre-wrap",
  
                wordBreak: "break-word",
  
                fontSize: 15.5,
  
                lineHeight: 1.65,
  
                color: "#172033",
              }}
            >
              {post.content}
            </Typography>
          )}
        </Box>
  
        {/* =========================
            IMAGE
        ========================= */}
  
        {imageUrl && (
          <Box
            sx={{
              width: "100%",
              bgcolor: "#07090d",
  
              borderTop: "1px solid",
              borderBottom: "1px solid",
  
              borderColor: "rgba(148,163,184,.12)",
  
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt="Post"
              loading="lazy"
              sx={{
                display: "block",
  
                width: "100%",
  
                maxHeight: {
                  xs: 500,
                  sm: 650,
                },
  
                objectFit: "contain",
  
                mx: "auto",
              }}
            />
          </Box>
        )}
  
        {/* =========================
            VIDEO
        ========================= */}
  
        {videoUrl && (
          <Box
            sx={{
              width: "100%",
  
              bgcolor: "#05070a",
  
              borderTop: "1px solid",
              borderBottom: "1px solid",
  
              borderColor: "rgba(148,163,184,.12)",
  
              overflow: "hidden",
            }}
          >
            <Box
              component="video"
              src={videoUrl}
              controls
              preload="metadata"
              playsInline
              sx={{
                display: "block",
  
                width: "100%",
  
                maxHeight: {
                  xs: 500,
                  sm: 650,
                },
  
                bgcolor: "#000",
              }}
            />
          </Box>
        )}
  
        {/* =========================
            COUNTS
        ========================= */}
  
        <Box
          sx={{
            px: 2.5,
            pt: 1.4,
          }}
        >
          <Box
            sx={{
              minHeight: 30,
  
              display: "flex",
  
              alignItems: "center",
  
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
  
                alignItems: "center",
  
                gap: 0.7,
              }}
            >
              {post.likeCount > 0 && (
                <>
                  <Box
                    sx={{
                      width: 21,
                      height: 21,
  
                      display: "grid",
  
                      placeItems: "center",
  
                      borderRadius: "50%",
  
                      background: "linear-gradient(135deg, #2563eb, #6366f1)",
  
                      boxShadow: "0 3px 8px rgba(37,99,235,.25)",
                    }}
                  >
                    <FavoriteRoundedIcon
                      sx={{
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </Box>
  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: 13.5,
                    }}
                  >
                    {post.likeCount}
                  </Typography>
                </>
              )}
            </Box>
  
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
              }}
            >
              {post.commentCount > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: 13.5,
  
                    cursor: "pointer",
  
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {post.commentCount}{" "}
                  {post.commentCount === 1 ? "comment" : "comments"}
                </Typography>
              )}
            </Box>
          </Box>
  
          <Divider
            sx={{
              mt: 0.8,
            }}
          />
  
          {/* =========================
              ACTIONS
          ========================= */}
  
          <Box
            sx={{
              display: "grid",
  
              gridTemplateColumns: "repeat(3, 1fr)",
  
              py: 0.6,
  
              gap: 0.5,
            }}
          >
            {/* LIKE */}
  
            <Box
              onClick={handleLike}
              sx={{
                cursor: likeMutation.isPending ? "default" : "pointer",
  
                userSelect: "none",
  
                minHeight: 43,
  
                display: "flex",
  
                justifyContent: "center",
  
                alignItems: "center",
  
                gap: 0.8,
  
                borderRadius: 2.5,
  
                transition: "all .18s ease",
  
                color: post.isLikedByCurrentUser ? "#e11d48" : "text.secondary",
  
                "&:hover": {
                  bgcolor: post.isLikedByCurrentUser
                    ? "rgba(225,29,72,.07)"
                    : "rgba(15,23,42,.045)",
                },
  
                "&:active": {
                  transform: "scale(.97)",
                },
              }}
            >
              {post.isLikedByCurrentUser ? (
                <FavoriteRoundedIcon
                  sx={{
                    fontSize: 21,
                  }}
                />
              ) : (
                <FavoriteBorderRoundedIcon
                  sx={{
                    fontSize: 21,
                  }}
                />
              )}
  
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
  
                  color: "inherit",
                }}
              >
                Like
              </Typography>
            </Box>
  
            {/* COMMENT */}
  
            <Box
              sx={{
                cursor: "pointer",
  
                userSelect: "none",
  
                minHeight: 43,
  
                display: "flex",
  
                justifyContent: "center",
  
                alignItems: "center",
  
                gap: 0.8,
  
                borderRadius: 2.5,
  
                color: "text.secondary",
  
                transition: "all .18s ease",
  
                "&:hover": {
                  bgcolor: "rgba(15,23,42,.045)",
                },
  
                "&:active": {
                  transform: "scale(.97)",
                },
              }}
              onClick={() => {
                setShowComments((value) => !value);
              }}
            >
              <ChatBubbleOutlineRoundedIcon
                sx={{
                  fontSize: 21,
                }}
              />
  
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                }}
              >
                Comment
              </Typography>
            </Box>
  
            {/* SHARE */}
  
            <Box
              sx={{
                cursor: "pointer",
  
                userSelect: "none",
  
                minHeight: 43,
  
                display: "flex",
  
                justifyContent: "center",
  
                alignItems: "center",
  
                gap: 0.8,
  
                borderRadius: 2.5,
  
                color: "text.secondary",
  
                transition: "all .18s ease",
  
                "&:hover": {
                  bgcolor: "rgba(15,23,42,.045)",
                },
  
                "&:active": {
                  transform: "scale(.97)",
                },
              }}
            >
              <ShareOutlinedIcon
                sx={{
                  fontSize: 21,
                }}
              />
  
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                }}
              >
                Share
              </Typography>
            </Box>
          </Box>
        </Box>
  
        {showComments && (
          <>
            <Divider />
            <CommentSection postId={post.id} />
          </>
        )}
      </Paper>
    );
  }