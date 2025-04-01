// JavaScript
const menu = document.getElementById('menu');
const menupage = document.getElementById('menupage');

menu.addEventListener('click', () => {
  
  // Force reflow to ensure transition works
  void menupage.offsetWidth;
  
  // Toggle translate position
  menupage.classList.toggle('translate-x-full');
  menupage.classList.toggle('translate-x-0');
});