using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SocialMedia.Infrastructure.Persistence.Configurations;

public class ConversationConfiguration
    : IEntityTypeConfiguration<Conversation>
{
    public void Configure(
        EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("Conversations");

        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.User1)
            .WithMany()
            .HasForeignKey(x => x.User1Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.User2)
            .WithMany()
            .HasForeignKey(x => x.User2Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Messages)
            .WithOne(x => x.Conversation)
            .HasForeignKey(x => x.ConversationId);

        builder.HasIndex(x => new
        {
            x.User1Id,
            x.User2Id
        })
        .IsUnique();

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}