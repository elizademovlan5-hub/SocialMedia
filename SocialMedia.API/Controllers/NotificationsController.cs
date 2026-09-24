using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using SocialMedia.Infrastructure.Persistence;
using System.Security.Claims;

namespace SMM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController
    : ControllerBase
{
    private readonly AppDbContext
        _dbContext;

    public NotificationsController(
        AppDbContext dbContext)
    {
        _dbContext =
            dbContext;
    }

    private Guid GetCurrentUserId()
    {
        return Guid.Parse(
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            )!
        );
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var userId =
            GetCurrentUserId();

        page =
            Math.Max(page, 1);

        pageSize =
            Math.Clamp(
                pageSize,
                1,
                50
            );

        var query =
            _dbContext
                .Notifications
                .AsNoTracking()
                .Where(x =>
                    x.UserId ==
                    userId
                );

        var totalCount =
            await query.CountAsync(
                cancellationToken
            );

        var items =
            await query
                .OrderByDescending(
                    x => x.CreatedAt
                )
                .Skip(
                    (page - 1) *
                    pageSize
                )
                .Take(pageSize)
                .Select(x =>
                    new NotificationResponse
                    {
                        Id =
                            x.Id,

                        Type =
                            x.Type,

                        Message =
                            x.Message,

                        IsRead =
                            x.IsRead,

                        CreatedAt =
                            x.CreatedAt,

                        ActorUserId =
                            x.ActorUserId,

                        ActorFirstName =
                            x.ActorUser != null
                                ? x.ActorUser.FirstName
                                : null,

                        ActorLastName =
                            x.ActorUser != null
                                ? x.ActorUser.LastName
                                : null,

                        ActorProfileImageUrl =
                            x.ActorUser != null
                                ? x.ActorUser.ProfileImageUrl
                                : null,

                        PostId =
                            x.PostId,

                        FriendRequestId =
                            x.FriendRequestId,

                        MessageId =
                            x.MessageId
                    })
                .ToListAsync(
                    cancellationToken
                );

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount
        });
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult> GetUnreadCount(
        CancellationToken cancellationToken)
    {
        var userId =
            GetCurrentUserId();

        var count =
            await _dbContext
                .Notifications
                .CountAsync(
                    x =>
                        x.UserId ==
                            userId &&
                        !x.IsRead,
                    cancellationToken
                );

        return Ok(new
        {
            count
        });
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId =
            GetCurrentUserId();

        var notification =
            await _dbContext
                .Notifications
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id &&
                        x.UserId ==
                            userId,
                    cancellationToken
                );

        if (notification is null)
        {
            return NotFound();
        }

        notification.IsRead =
            true;

        notification.ReadAt =
            DateTime.UtcNow;

        await _dbContext
            .SaveChangesAsync(
                cancellationToken
            );

        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(
        CancellationToken cancellationToken)
    {
        var userId =
            GetCurrentUserId();

        var notifications =
            await _dbContext
                .Notifications
                .Where(x =>
                    x.UserId ==
                        userId &&
                    !x.IsRead
                )
                .ToListAsync(
                    cancellationToken
                );

        var now =
            DateTime.UtcNow;

        foreach (
            var notification in notifications
        )
        {
            notification.IsRead =
                true;

            notification.ReadAt =
                now;
        }

        await _dbContext
            .SaveChangesAsync(
                cancellationToken
            );

        return NoContent();
    }
}