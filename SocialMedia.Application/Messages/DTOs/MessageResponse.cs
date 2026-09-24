using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SocialMedia.Application.Messages.DTOs
{
    public class MessageResponse
    {
        public Guid Id { get; set; }

        public Guid ConversationId { get; set; }

        public Guid SenderId { get; set; }

        public Guid ReceiverId { get; set; }

        public string Content { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public bool IsRead { get; set; }

        public DateTime? ReadAt { get; set; }
    }
}
