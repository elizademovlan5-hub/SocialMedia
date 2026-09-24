using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMedia.Application.Comments.DTOs;
using SocialMedia.Infrastructure.Persistence;

using System.Security.Claims;

namespace SMM.Api.Controllers;

[ApiController]
[Route("api/posts/{postId:guid}/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CommentsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrWhiteSpace(value))
        {
            throw new UnauthorizedAccessException();
        }

        return Guid.Parse(value);
    }

    [HttpGet]
    public async Task<ActionResult> GetComments(
        Guid postId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();

        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var postExists = await _dbContext.Posts
            .AnyAsync(
                x => x.Id == postId,
                cancellationToken
            );

        if (!postExists)
        {
            return NotFound(new
            {
                message = "Post not found."
            });
        }

        var query = _dbContext.Comments
            .AsNoTracking()
            .Where(x => x.PostId == postId);

        var totalCount = await query.CountAsync(
            cancellationToken
        );

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new CommentResponse
            {
                Id = x.Id,
                Content = x.Content,
                CreatedAt = x.CreatedAt,

                UserId = x.UserId,
                UserName = x.User.UserName!,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                ProfileImageUrl =
                    x.User.ProfileImageUrl,

                IsMine = x.UserId == userId
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            )
        });
    }

    [HttpPost]
    public async Task<ActionResult<CommentResponse>> Create(
        Guid postId,
        CreateCommentRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new
            {
                message = "Comment cannot be empty."
            });
        }

        var postExists = await _dbContext.Posts
            .AnyAsync(
                x => x.Id == postId,
                cancellationToken
            );

        if (!postExists)
        {
            return NotFound(new
            {
                message = "Post not found."
            });
        }

        var comment = new Comment
        {
            PostId = postId,
            UserId = userId,
            Content = request.Content.Trim()
        };

        _dbContext.Comments.Add(comment);

        await _dbContext.SaveChangesAsync(
            cancellationToken
        );

        var result = await _dbContext.Comments
            .AsNoTracking()
            .Where(x => x.Id == comment.Id)
            .Select(x => new CommentResponse
            {
                Id = x.Id,
                Content = x.Content,
                CreatedAt = x.CreatedAt,

                UserId = x.UserId,
                UserName = x.User.UserName!,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                ProfileImageUrl =
                    x.User.ProfileImageUrl,

                IsMine = true
            })
            .FirstAsync(cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{commentId:guid}")]
    public async Task<IActionResult> Delete(
        Guid postId,
        Guid commentId,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var comment = await _dbContext.Comments
            .FirstOrDefaultAsync(
                x =>
                    x.Id == commentId &&
                    x.PostId == postId,
                cancellationToken
            );

        if (comment is null)
        {
            return NotFound();
        }

        if (comment.UserId != userId)
        {
            return Forbid();
        }

        comment.IsDeleted = true;
        comment.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(
            cancellationToken
        );

        return NoContent();
    }
}