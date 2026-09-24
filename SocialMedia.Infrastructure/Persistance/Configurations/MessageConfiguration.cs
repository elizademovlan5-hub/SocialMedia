using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SocialMedia.Infrastructure.Persistence.Configurations;

public class MessageConfiguration
    : IEntityTypeConfiguration<Message>
{
    public void Configure(
        EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("Messages");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Content)
            .IsRequired()
            .HasMaxLength(4000);

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
            x.ReceiverId,
            x.IsRead
        });

        builder.HasIndex(x => new
        {
            x.ConversationId,
            x.CreatedAt
        });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}