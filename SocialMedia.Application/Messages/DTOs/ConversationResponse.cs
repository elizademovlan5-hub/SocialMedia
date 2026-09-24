using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SocialMedia.Application.Messages.DTOs
{
    public class ConversationResponse
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string FirstName { get; set; } = null!;

        public string LastName { get; set; } = null!;

        public string UserName { get; set; } = null!;

        public string? ProfileImageUrl { get; set; }

        public bool IsOnline { get; set; }

        public DateTime? LastSeenAt { get; set; }

        public string? LastMessage { get; set; }

        public DateTime? LastMessageAt { get; set; }

        public int UnreadCount { get; set; }
    }
}
