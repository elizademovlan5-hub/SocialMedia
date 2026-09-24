using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

using SocialMedia.Infrastructure.Persistence;
using System.Security.Claims;

namespace SocialMedia.Infrastructure.Realtime;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _dbContext;

    public ChatHub(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private Guid GetUserId()
    {
        var value = Context.User?
            .FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        return Guid.Parse(value!);
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(
                x => x.Id == userId
            );

        if (user is not null)
        {
            user.IsOnline = true;

            await _dbContext.SaveChangesAsync();

            await Clients.Others.SendAsync(
                "userOnline",
                userId
            );
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        var userId = GetUserId();

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(
                x => x.Id == userId
            );

        if (user is not null)
        {
            user.IsOnline = false;

            user.LastSeenAt =
                DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            await Clients.Others.SendAsync(
                "userOffline",
                new
                {
                    userId,
                    lastSeenAt =
                        user.LastSeenAt
                }
            );
        }

        await base.OnDisconnectedAsync(
            exception
        );
    }
}