using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SocialMedia.Domain.Entities;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Xml.Linq;

namespace SocialMedia.Infrastructure.Persistence;

public class AppDbContext
    : IdentityDbContext<
        AppUser,
        IdentityRole<Guid>,
        Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Conversation> Conversations
    => Set<Conversation>();

    public DbSet<Message> Messages
        => Set<Message>();

    public DbSet<FriendRequest> FriendRequests
=> Set<FriendRequest>();

    public DbSet<Friendship> Friendships
        => Set<Friendship>();

    public DbSet<Notification> Notifications
        => Set<Notification>();

    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(
            typeof(AppDbContext).Assembly
        );
    }
}