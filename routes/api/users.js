const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const userController = require('../../controllers/userController');

// Получить профиль пользователя
router.get('/me', auth, userController.getProfile);

// Обновить профиль пользователя
router.put('/me', auth, userController.updateProfile);

// Экспорт данных пользователя
router.get('/export', auth, userController.exportUserData);

// Получить список пользователей (только для админов)
router.get('/', auth, userController.getUsers);

// Получить пользователя по ID (только для админов)
router.get('/:id', auth, userController.getUserById);

// Обновить пользователя (только для админов)
router.put('/:id', auth, userController.updateUser);

// Удалить пользователя (только для админов)
router.delete('/:id', auth, userController.deleteUser);

module.exports = router; 