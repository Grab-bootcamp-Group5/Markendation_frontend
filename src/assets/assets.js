// Import all images from assets/images directory
import botmiImg from './images/botmi.jpg';
import cachuaImg from './images/cachua.jpg';
import caImg from './images/ca.jpg';
import carotImg from './images/carot.jpg';
import cartImg from './images/cart.png';
import comgaImg from './images/comga.jpg';
import dauanImg from './images/dauan.jpg';
import duongImg from './images/duong.jpg';
import gaoImg from './images/gao.jpg';
import garanImg from './images/garan.jpg';
import hatnemImg from './images/hatnem.jpg';
import logoImg from './images/logo.png';
import muoiImg from './images/muoi.jpg';
import myybobamImg from './images/myybobam.jpg';
import nuocmamImg from './images/nuocmam.jpg';
import phobobImg from './images/phobo.jpeg';
import pizzagaImg from './images/pizzaga.jpg';
import bokhoImg from './images/bokho.jpg';
import thitboImg from './images/thitbo.jpg';
import thitgaImg from './images/thitga.jpg';
import thitheoImg from './images/thitheo.jpg';
import toiImg from './images/toi.jpg';
import tomImg from './images/tom.jpg';

// Export all images as a single object
export const images = {
    botmi: botmiImg,
    cachua: cachuaImg,
    ca: caImg,
    carot: carotImg,
    cart: cartImg,
    comga: comgaImg,
    dauan: dauanImg,
    duong: duongImg,
    gao: gaoImg,
    garan: garanImg,
    hatnem: hatnemImg,
    logo: logoImg,
    muoi: muoiImg,
    myybobam: myybobamImg,
    nuocmam: nuocmamImg,
    phobo: phobobImg,
    pizzaga: pizzagaImg,
    bokho: bokhoImg,
    thitbo: thitboImg,
    thitga: thitgaImg,
    thitheo: thitheoImg,
    toi: toiImg,
    tom: tomImg
};

// Unified and consistent ingredients list
export const ingredientsList = [
    { id: 1, name: "Bột Mì", englishName: "flour", category: "Bột", restaurantCount: 21, image: images.botmi },
    { id: 2, name: "Gạo", englishName: "rice", category: "Gạo", restaurantCount: 45, image: images.gao },
    { id: 3, name: "Dầu Ăn", englishName: "vegetable oil", category: "Dầu ăn", restaurantCount: 36, image: images.dauan },
    { id: 4, name: "Nước Mắm", englishName: "fish sauce", category: "Gia vị", restaurantCount: 50, image: images.nuocmam },
    { id: 5, name: "Thịt Bò", englishName: "beef", category: "Thịt", restaurantCount: 47, image: images.thitbo },
    { id: 6, name: "Thịt Gà", englishName: "chicken", category: "Thịt", restaurantCount: 52, image: images.thitga },
    { id: 7, name: "Tỏi", englishName: "garlic", category: "Rau củ", restaurantCount: 55, image: images.toi },
    { id: 8, name: "Cà Chua", englishName: "tomato", category: "Rau củ", restaurantCount: 40, image: images.cachua },
    { id: 9, name: "Muối", englishName: "salt", category: "Gia vị", restaurantCount: 42, image: images.muoi },
    { id: 10, name: "Hạt Nêm", englishName: "chicken broth", category: "Gia vị", restaurantCount: 33, image: images.hatnem },
    { id: 11, name: "Đường", englishName: "sugar", category: "Gia vị", restaurantCount: 28, image: images.duong },
    { id: 12, name: "Cà Rốt", englishName: "carrot", category: "Rau củ", restaurantCount: 38, image: images.carot },
    { id: 13, name: "Thịt Heo", englishName: "pork", category: "Thịt", restaurantCount: 49, image: images.thitheo },
    { id: 14, name: "Tôm", englishName: "shrimp", category: "Hải sản", restaurantCount: 44, image: images.tom },
    { id: 15, name: "Cá", englishName: "fish", category: "Hải sản", restaurantCount: 41, image: images.ca }
];

// Dishes list with references to ingredients
export const dishesList = [
    {
        id: 1,
        name: "Phở Bò",
        englishName: "Beef Pho",
        category: "Món Việt",
        image: images.phobo,
        ingredientIds: [2, 5, 7, 9, 10]
    },
    {
        id: 2,
        name: "Cơm Gà",
        englishName: "Chicken Rice",
        category: "Món Việt",
        image: images.comga,
        ingredientIds: [2, 6, 7, 9, 10]
    },
    {
        id: 3,
        name: "Pizza Gà",
        englishName: "Chicken Pizza",
        category: "Món Ý",
        image: images.pizzaga,
        ingredientIds: [1, 3, 6, 7, 8, 9]
    },
    {
        id: 4,
        name: "Mì Ý Bò Bằm",
        englishName: "Beef Spaghetti",
        category: "Món Ý",
        image: images.myybobam,
        ingredientIds: [1, 3, 5, 7, 8, 9]
    },
    {
        id: 5,
        name: "Gà Rán",
        englishName: "Fried Chicken",
        category: "Món Âu",
        image: images.garan,
        ingredientIds: [1, 3, 6, 9, 10]
    },
    {
        id: 6,
        name: "Bò Kho",
        englishName: "Beef Stew",
        category: "Món Việt",
        image: images.bokho,
        ingredientIds: [5, 7, 8, 9, 10]
    }
];

// Helper function to get full ingredient details from ID
export const getIngredientById = (id) => {
    return ingredientsList.find(ingredient => ingredient.id === id);
};

// Helper function to get dish with full ingredient details
export const getDishWithIngredients = (dishId) => {
    const dish = dishesList.find(dish => dish.id === dishId);

    if (!dish) return null;

    const dishWithIngredients = {
        ...dish,
        ingredients: dish.ingredientIds.map(id => getIngredientById(id)).filter(Boolean)
    };

    return dishWithIngredients;
};

// Export a default object with all data
export default {
    images,
    ingredientsList,
    dishesList,
    getIngredientById,
    getDishWithIngredients
};