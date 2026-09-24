using Microsoft.AspNetCore.Http;

public class CreatePostRequest
{
    public string? Content { get; set; }

    public IFormFile? Image { get; set; }
    public IFormFile? Video { get; set; }

}