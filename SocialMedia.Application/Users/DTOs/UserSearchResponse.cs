using SocialMedia.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SocialMedia.Application.Users.DTOs
{
    public class UserSearchResponse
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; } = null!;

        public string LastName { get; set; } = null!;

        public string UserName { get; set; } = null!;

        public string? ProfileImageUrl { get; set; }

        public bool IsOnline { get; set; }

        public UserRelationshipStatus RelationshipStatus { get; set; }

        public Guid? FriendRequestId { get; set; }
    }
}
