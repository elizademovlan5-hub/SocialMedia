using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMedia.Application.Users.DTOs;
using SocialMedia.Domain.Enums;
using SocialMedia.Infrastructure.Persistence;
using System.Security.Claims;

namespace SocialMedia.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public UsersController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            var email = User.FindFirstValue(
                ClaimTypes.Email
            );

            return Ok(new
            {
                userId,
                email
            });
        }

        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers(
    [FromQuery] string? search,
    CancellationToken cancellationToken)
        {
            var currentUserId = Guid.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );

            var query = _dbContext.Users
                .AsNoTracking()
                .Where(x => x.Id != currentUserId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();

                query = query.Where(x =>
                    x.FirstName.Contains(term) ||
                    x.LastName.Contains(term) ||
                    x.UserName!.Contains(term)
                );
            }

            var users = await query
                .OrderBy(x => x.FirstName)
                .Take(30)
                .Select(x => new
                {
                    x.Id,
                    x.FirstName,
                    x.LastName,
                    x.UserName,
                    x.ProfileImageUrl,
                    x.IsOnline
                })
                .ToListAsync(cancellationToken);

            var result = new List<UserSearchResponse>();

            foreach (var user in users)
            {
                var minId =
                    currentUserId.CompareTo(user.Id) < 0
                        ? currentUserId
                        : user.Id;

                var maxId =
                    currentUserId.CompareTo(user.Id) < 0
                        ? user.Id
                        : currentUserId;

                var areFriends = await _dbContext
                    .Friendships
                    .AsNoTracking()
                    .AnyAsync(
                        x =>
                            x.User1Id == minId &&
                            x.User2Id == maxId,
                        cancellationToken
                    );

                if (areFriends)
                {
                    result.Add(new UserSearchResponse
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        UserName = user.UserName!,
                        ProfileImageUrl =
                            user.ProfileImageUrl,
                        IsOnline = user.IsOnline,

                        RelationshipStatus =
                            UserRelationshipStatus.Friends
                    });

                    continue;
                }

                var request = await _dbContext
                    .FriendRequests
                    .AsNoTracking()
                    .Where(x =>
                        x.Status ==
                            FriendRequestStatus.Pending &&
                        (
                            (
                                x.SenderId ==
                                    currentUserId &&
                                x.ReceiverId ==
                                    user.Id
                            )
                            ||
                            (
                                x.SenderId ==
                                    user.Id &&
                                x.ReceiverId ==
                                    currentUserId
                            )
                        )
                    )
                    .FirstOrDefaultAsync(
                        cancellationToken
                    );

                var status =
                    UserRelationshipStatus.None;

                if (request is not null)
                {
                    status =
                        request.SenderId ==
                            currentUserId
                            ? UserRelationshipStatus
                                .OutgoingRequest
                            : UserRelationshipStatus
                                .IncomingRequest;
                }

                result.Add(new UserSearchResponse
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserName = user.UserName!,
                    ProfileImageUrl =
                        user.ProfileImageUrl,
                    IsOnline = user.IsOnline,

                    RelationshipStatus =
                        status,

                    FriendRequestId =
                        request?.Id
                });
            }

            return Ok(result);
        }
    }
}
