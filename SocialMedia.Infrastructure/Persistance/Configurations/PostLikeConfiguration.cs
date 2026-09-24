using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace SocialMedia.Infrastructure.Persistence.Configurations;

public class PostLikeConfiguration : IEntityTypeConfiguration<PostLike>
{
    public void Configure(EntityTypeBuilder<PostLike> builder)
    {
        builder.ToTable("PostLikes");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new
        {
            x.UserId,
            x.PostId
        })
        .IsUnique();

        builder.HasOne(x => x.User)
            .WithMany(x => x.PostLikes)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Post)
            .WithMany(x => x.Likes)
            .HasForeignKey(x => x.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}