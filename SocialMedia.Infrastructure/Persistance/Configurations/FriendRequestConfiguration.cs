using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SocialMedia.Infrastructure.Persistence.Configurations;

public class FriendRequestConfiguration
    : IEntityTypeConfiguration<FriendRequest>
{
    public void Configure(
        EntityTypeBuilder<FriendRequest> builder)
    {
        builder.ToTable("FriendRequests");

        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Sender)
            .WithMany()
            .HasForeignKey(x => x.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Receiver)
            .WithMany()
            .HasForeignKey(x => x.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new
        {
            x.SenderId,
            x.ReceiverId,
            x.Status
        });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}