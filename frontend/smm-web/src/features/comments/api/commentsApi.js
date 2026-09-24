import api from '../../../api/axios';

export async function getComments(
  postId,
  {
    page = 1,
    pageSize = 20,
  } = {}
) {
  
  const response = await api.get(
    `/posts/${postId}/comments`,
    {
      params: {
        page,
        pageSize,
      },
    }
  );

  return response.data;
}

export async function createComment(
  postId,
  content
) {
  const response = await api.post(
    `/posts/${postId}/comments`,
    {
      content,
    }
  );

  return response.data;
}

export async function deleteComment(
  postId,
  commentId
) {
  await api.delete(
    `/posts/${postId}/comments/${commentId}`
  );
}