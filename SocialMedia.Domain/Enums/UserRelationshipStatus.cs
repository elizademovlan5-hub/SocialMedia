using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SocialMedia.Domain.Enums
{
    public enum UserRelationshipStatus
    {
        None = 0,
        Friends = 1,
        OutgoingRequest = 2,
        IncomingRequest = 3
    }
}
