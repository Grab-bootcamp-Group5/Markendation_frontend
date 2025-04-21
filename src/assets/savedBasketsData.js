// Import images from assets
import { images } from './assets';

// Saved baskets data
export const savedBaskets = [
    {
        id: 1,
        name: "Basket's Name",
        createdAt: "2025-04-15T10:30:00",
        ingredients: [
            {
                id: 1,
                name: "Bột Mì",
                image: images.botmi,
                quantity: 2,
                unit: "KG",
                category: "Bột"
            },
            {
                id: 3,
                name: "Dầu Ăn",
                image: images.dauan,
                quantity: 1.5,
                unit: "Lít",
                category: "Dầu ăn"
            }
        ],
        dishes: {
            "3": {
                id: 3,
                name: "Pizza Gà",
                image: images.pizzaga,
                servings: 1,
                ingredients: [
                    {
                        id: 1,
                        name: "Bột Mì",
                        image: images.botmi,
                        quantity: 2,
                        unit: "KG",
                        category: "Bột"
                    },
                    {
                        id: 3,
                        name: "Dầu Ăn",
                        image: images.dauan,
                        quantity: 1.5,
                        unit: "Lít",
                        category: "Dầu ăn"
                    }
                ]
            },
            "4": {
                id: 4,
                name: "Pizza Bò",
                image: images.myybobam,
                servings: 2,
                ingredients: [
                    {
                        id: 5,
                        name: "Thịt Bò",
                        image: images.thitbo,
                        quantity: 0.5,
                        unit: "KG",
                        category: "Thịt"
                    }
                ]
            }
        }
    },
    {
        id: 2,
        name: "Món ăn cuối tuần",
        createdAt: "2025-04-10T14:20:00",
        ingredients: [
            {
                id: 2,
                name: "Gạo",
                image: images.gao,
                quantity: 3,
                unit: "KG",
                category: "Gạo"
            },
            {
                id: 5,
                name: "Thịt Bò",
                image: images.thitbo,
                quantity: 1,
                unit: "KG",
                category: "Thịt"
            }
        ],
        dishes: {
            "1": {
                id: 1,
                name: "Phở Bò",
                image: images.phobo,
                servings: 2,
                ingredients: [
                    {
                        id: 2,
                        name: "Gạo",
                        image: images.gao,
                        quantity: 0.5,
                        unit: "KG",
                        category: "Gạo"
                    },
                    {
                        id: 5,
                        name: "Thịt Bò",
                        image: images.thitbo,
                        quantity: 0.3,
                        unit: "KG",
                        category: "Thịt"
                    }
                ]
            }
        }
    },
    {
        id: 3,
        name: "Nguyên liệu hàng tháng",
        createdAt: "2025-04-01T09:15:00",
        ingredients: [
            {
                id: 4,
                name: "Nước Mắm",
                image: images.nuocmam,
                quantity: 1,
                unit: "KG",
                category: "Gia vị"
            },
            {
                id: 7,
                name: "Tỏi",
                image: images.toi,
                quantity: 1,
                unit: "KG",
                category: "Rau củ"
            },
            {
                id: 11,
                name: "Đường",
                image: images.duong,
                quantity: 1,
                unit: "KG",
                category: "Gia vị"
            },
            {
                id: 12,
                name: "Cà Rốt",
                image: images.carot,
                quantity: 1,
                unit: "KG",
                category: "Rau củ"
            },
            {
                id: 2,
                name: "Gạo",
                image: images.gao,
                quantity: 1,
                unit: "KG",
                category: "Gạo"
            }
        ],
        dishes: {
            "5": {
                id: 5,
                name: "Gà Rán",
                image: images.garan,
                servings: 1,
                ingredients: [
                    {
                        id: 1,
                        name: "Bột Mì",
                        image: images.botmi,
                        quantity: 0.1,
                        unit: "KG",
                        category: "Bột"
                    },
                    {
                        id: 3,
                        name: "Dầu Ăn",
                        image: images.dauan,
                        quantity: 0.1,
                        unit: "Lít",
                        category: "Dầu ăn"
                    },
                    {
                        id: 6,
                        name: "Thịt Gà",
                        image: images.thitga,
                        quantity: 0.1,
                        unit: "KG",
                        category: "Thịt"
                    },
                    {
                        id: 9,
                        name: "Muối",
                        image: images.muoi,
                        quantity: 0.1,
                        unit: "KG",
                        category: "Gia vị"
                    },
                    {
                        id: 10,
                        name: "Hạt Nêm",
                        image: images.hatnem,
                        quantity: 0.1,
                        unit: "KG",
                        category: "Gia vị"
                    }
                ]
            }
        }
    }
];

export const getSavedBasketById = (basketId) => {
    return savedBaskets.find(basket => basket.id === Number(basketId)) || null;
};