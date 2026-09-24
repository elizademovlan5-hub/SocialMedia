import api from '../../../api/axios';

export async function getPosts({
  page = 1,
  pageSize = 10,
}) {
  const response = await api.get('/posts', {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
}

export async function createPost({
  content,
  image,
  video,
}) {
  const formData = new FormData();

  if (content?.trim()) {
    formData.append(
      'content',
      content.trim()
    );
  }

  if (image) {
    formData.append('image', image);
  }

  if (video) {
    formData.append('video', video);
  }

  const response = await api.post(
    '/posts',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function likePost(postId) {
  const response = await api.post(
    `/posts/${postId}/like`
  );

  return response.data;
}

export async function unlikePost(postId) {
  const response = await api.delete(
    `/posts/${postId}/like`
  );

  return response.data;
}