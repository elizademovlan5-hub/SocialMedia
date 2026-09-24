namespace SocialMedia.Application.Comments.DTOs;

public class CommentResponse
{
    public Guid Id { get; set; }

    public string Content { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public Guid UserId { get; set; }

    public string UserName { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? ProfileImageUrl { get; set; }

    public bool IsMine { get; set; }
}