// Handle Discord card click
document.addEventListener('DOMContentLoaded', () => {
  const discordCard = document.querySelector('.discord-card');
  if (discordCard) {
    discordCard.addEventListener('click', () => {
      window.open('https://discord.com/users/kavinrajasekaran', '_blank');
    });
  }

  // Function to set up collapsible items
  function setupCollapsibleItems(itemsSelector) {
    const items = document.querySelectorAll(itemsSelector);
    items.forEach(item => {
      const description = item.querySelector('.description');
      const toggleIcon = item.querySelector('.toggle-icon');
      
      if (description) {
        // Add click event to toggle description
        item.addEventListener('click', (e) => {
          // Toggle expanded class for item
          item.classList.toggle('expanded');
          
          // Toggle expanded class for description
          description.classList.toggle('expanded');
        });
        
        // Add hover effect
        item.style.cursor = 'pointer';
      }
    });
  }

  // Set up both experience and education collapsible items
  setupCollapsibleItems('.experience-item');
  setupCollapsibleItems('.education-item');

  // Add active class to nav links based on current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // Handle root path
    if (currentPath.endsWith('/') && linkPath === '#') {
      link.classList.add('active');
    }
    // Handle specific pages
    else if (currentPath.includes(linkPath) && linkPath !== '#') {
      link.classList.add('active');
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}); 