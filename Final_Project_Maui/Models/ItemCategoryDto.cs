using System;
using System.Collections.Generic;
using System.Text;

namespace Final_Project_Maui.Models
{
    public class ItemCategoryDto
    {
        public int ItemCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? CategoryDescription { get; set; }
        public bool IsActive { get; set; }
    }


}
