using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SocialMedia.Infrastructure.Persistence;
using System.Security.Claims;

namespace SMM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize]
public class PostsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IFileStorageService _fileStorage;
    public PostsController(AppDbContext dbContext, IFileStorageService fileStorage)
    {
        _dbContext = dbContext;
        _fileStorage = fileStorage;
    }

    private Guid GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException();
        }

        return Guid.Parse(userId);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<PostResponse>> Create(
    [FromForm] CreatePostRequest request,
    CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (
            string.IsNullOrWhiteSpace(request.Content) &&
            request.Image is null &&
            request.Video is null
        )
        {
            return BadRequest(new
            {
                message = "Post cannot be empty."
            });
        }

        if (
            request.Image is not null &&
            request.Video is not null
        )
        {
            return BadRequest(new
            {
                message =
                    "A post can contain either an image or a video, not both."
            });
        }

        string? imageUrl = null;
        string? videoUrl = null;

        try
        {
            if (request.Image is not null)
            {
                imageUrl =
                    await _fileStorage.SaveImageAsync(
                        request.Image,
                        cancellationToken
                    );
            }

            if (request.Video is not null)
            {
                videoUrl =
                    await _fileStorage.SaveVideoAsync(
                        request.Video,
                        cancellationToken
                    );
            }

            var post = new Post
            {
                UserId = userId,
                Content = request.Content?.Trim(),
                ImageUrl = imageUrl,
                VideoUrl = videoUrl
            };

            _dbContext.Posts.Add(post);

            await _dbContext.SaveChangesAsync(
                cancellationToken
            );

            var createdPost =
                await _dbContext.Posts
                    .AsNoTracking()
                    .Where(x => x.Id == post.Id)
                    .Select(x => new PostResponse
                    {
                        Id = x.Id,
                        Content = x.Content,
                        ImageUrl = x.ImageUrl,
                        VideoUrl = x.VideoUrl,

                        CreatedAt = x.CreatedAt,
                        UpdatedAt = x.UpdatedAt,

                        UserId = x.UserId,
                        UserName = x.User.UserName!,
                        FirstName = x.User.FirstName,
                        LastName = x.User.LastName,

                        ProfileImageUrl =
                            x.User.ProfileImageUrl,

                        LikeCount = x.Likes.Count(),
                        CommentCount =
                            x.Comments.Count(),

                        IsLikedByCurrentUser = false
                    })
                    .FirstAsync(
                        cancellationToken
                    );

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = createdPost.Id
                },
                createdPost
            );
        }
        catch (InvalidOperationException ex)
        {
            if (imageUrl is not null)
            {
                await _fileStorage.DeleteAsync(
                    imageUrl,
                    cancellationToken
                );
            }

            if (videoUrl is not null)
            {
                await _fileStorage.DeleteAsync(
                    videoUrl,
                    cancellationToken
                );
            }

            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PostResponse>> GetById(Guid id)
    {
        var userId = GetCurrentUserId();

        var post = await _dbContext.Posts
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new PostResponse
            {
                Id = x.Id,
                Content = x.Content,
                ImageUrl = x.ImageUrl,
                VideoUrl = x.VideoUrl,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,

                UserId = x.UserId,
                UserName = x.User.UserName!,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                ProfileImageUrl = x.User.ProfileImageUrl,

                LikeCount = x.Likes.Count(),
                CommentCount = x.Comments.Count(),

                IsLikedByCurrentUser =
                    x.Likes.Any(l => l.UserId == userId)
            })
            .FirstOrDefaultAsync();

        if (post is null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    [HttpGet]
    public async Task<ActionResult> GetFeed(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetCurrentUserId();

        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _dbContext.Posts
            .AsNoTracking();

        var totalCount = await query.CountAsync();

        var posts = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PostResponse
            {
                Id = x.Id,
                Content = x.Content,
                ImageUrl = x.ImageUrl,
                VideoUrl = x.VideoUrl,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,

                UserId = x.UserId,
                UserName = x.User.UserName!,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                ProfileImageUrl = x.User.ProfileImageUrl,

                LikeCount = x.Likes.Count(),
                CommentCount = x.Comments.Count(),

                IsLikedByCurrentUser =
                    x.Likes.Any(l => l.UserId == userId)
            })
            .ToListAsync();

        return Ok(new
        {
            items = posts,
            page,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            )
        });
    }

    [HttpPut("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(
    Guid id,
    [FromForm] UpdatePostRequest request,
    CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken
            );

        if (post is null)
        {
            return NotFound(new
            {
                message = "Post not found."
            });
        }

        if (post.UserId != userId)
        {
            return Forbid();
        }

        if (
            request.Image is not null &&
            request.Video is not null
        )
        {
            return BadRequest(new
            {
                message =
                    "A post can contain either an image or a video, not both."
            });
        }

        string? newImageUrl = null;
        string? newVideoUrl = null;

        try
        {
            // =========================
            // Remove existing image
            // =========================
            if (request.RemoveImage && post.ImageUrl is not null)
            {
                await _fileStorage.DeleteAsync(
                    post.ImageUrl,
                    cancellationToken
                );

                post.ImageUrl = null;
            }

            // =========================
            // Remove existing video
            // =========================
            if (request.RemoveVideo && post.VideoUrl is not null)
            {
                await _fileStorage.DeleteAsync(
                    post.VideoUrl,
                    cancellationToken
                );

                post.VideoUrl = null;
            }

            // =========================
            // New image
            // =========================
            if (request.Image is not null)
            {
                // Əgər əvvəl video varsa sil
                if (post.VideoUrl is not null)
                {
                    await _fileStorage.DeleteAsync(
                        post.VideoUrl,
                        cancellationToken
                    );

                    post.VideoUrl = null;
                }

                // Əgər əvvəl image varsa sil
                if (post.ImageUrl is not null)
                {
                    await _fileStorage.DeleteAsync(
                        post.ImageUrl,
                        cancellationToken
                    );
                }

                newImageUrl =
                    await _fileStorage.SaveImageAsync(
                        request.Image,
                        cancellationToken
                    );

                post.ImageUrl = newImageUrl;
            }

            // =========================
            // New video
            // =========================
            if (request.Video is not null)
            {
                // Əgər əvvəl image varsa sil
                if (post.ImageUrl is not null)
                {
                    await _fileStorage.DeleteAsync(
                        post.ImageUrl,
                        cancellationToken
                    );

                    post.ImageUrl = null;
                }

                // Əgər əvvəl video varsa sil
                if (post.VideoUrl is not null)
                {
                    await _fileStorage.DeleteAsync(
                        post.VideoUrl,
                        cancellationToken
                    );
                }

                newVideoUrl =
                    await _fileStorage.SaveVideoAsync(
                        request.Video,
                        cancellationToken
                    );

                post.VideoUrl = newVideoUrl;
            }

            post.Content = request.Content?.Trim();
            post.UpdatedAt = DateTime.UtcNow;

            if (
                string.IsNullOrWhiteSpace(post.Content) &&
                post.ImageUrl is null &&
                post.VideoUrl is null
            )
            {
                return BadRequest(new
                {
                    message = "Post cannot be empty."
                });
            }

            await _dbContext.SaveChangesAsync(
                cancellationToken
            );

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            if (newImageUrl is not null)
            {
                await _fileStorage.DeleteAsync(
                    newImageUrl,
                    cancellationToken
                );
            }

            if (newVideoUrl is not null)
            {
                await _fileStorage.DeleteAsync(
                    newVideoUrl,
                    cancellationToken
                );
            }

            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
    Guid id,
    CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken
            );

        if (post is null)
        {
            return NotFound();
        }

        if (post.UserId != userId)
        {
            return Forbid();
        }

        if (post.ImageUrl is not null)
        {
            await _fileStorage.DeleteAsync(
                post.ImageUrl,
                cancellationToken
            );
        }

        if (post.VideoUrl is not null)
        {
            await _fileStorage.DeleteAsync(
                post.VideoUrl,
                cancellationToken
            );
        }

        post.IsDeleted = true;
        post.ImageUrl = null;
        post.VideoUrl = null;
        post.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(
            cancellationToken
        );

        return NoContent();
    }

    [HttpPost("{id:guid}/like")]
    public async Task<IActionResult> Like(Guid id)
    {
        var userId = GetCurrentUserId();

        var postExists = await _dbContext.Posts
            .AnyAsync(x => x.Id == id);

        if (!postExists)
        {
            return NotFound();
        }

        var existingLike = await _dbContext.PostLikes
            .FirstOrDefaultAsync(x =>
                x.PostId == id &&
                x.UserId == userId
            );

        if (existingLike is not null)
        {
            return BadRequest(new
            {
                message = "Post is already liked."
            });
        }

        var like = new PostLike
        {
            PostId = id,
            UserId = userId
        };

        _dbContext.PostLikes.Add(like);

        await _dbContext.SaveChangesAsync();

        var likeCount = await _dbContext.PostLikes
            .CountAsync(x => x.PostId == id);

        return Ok(new
        {
            postId = id,
            isLiked = true,
            likeCount
        });
    }

    [HttpDelete("{id:guid}/like")]
    public async Task<IActionResult> Unlike(Guid id)
    {
        var userId = GetCurrentUserId();

        var like = await _dbContext.PostLikes
            .FirstOrDefaultAsync(x =>
                x.PostId == id &&
                x.UserId == userId
            );

        if (like is null)
        {
            return NotFound(new
            {
                message = "Like not found."
            });
        }

        _dbContext.PostLikes.Remove(like);

        await _dbContext.SaveChangesAsync();

        var likeCount = await _dbContext.PostLikes
            .CountAsync(x => x.PostId == id);

        return Ok(new
        {
            postId = id,
            isLiked = false,
            likeCount
        });
    }
}