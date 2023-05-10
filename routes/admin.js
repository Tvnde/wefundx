var express = require('express');
var router = express.Router();
const adminService = require('../services/adminService');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const userService = require('../services/userService');
const { User } = require('../models');


router.get('/', function (req, res) {
    res.render('admin/login', { title: 'Admin Login' });
});

router.get('/create', (req, res) => {
    res.render('admin/signup', { title: 'Create Admin' });
});

router.post('/create', async (req, res, next) => {
    try {
        await adminService.create(req.body);
        res.render('admin/login', { title: 'New Admin Login' });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        req.session.admin = await adminService.login(req.body);
        res.redirect('/admin/dashboard');
    } catch (err) {
        next(err);
    }
});

router.get('/dashboard', authenticateAdmin, async (req, res, next) => {
    const criteria = {
        where: {
            description: 'withdrawal', status: 'pending'
        },
        attributes: ['id', 'amount', 'status', 'createdAt'],
        include: {
            model: User,
            attributes: ['id', 'fullname']
        },
        order: [
            ['createdAt', 'DESC']
        ]
    };
    const { transactions: withdrawals } = await walletService.fetchTransactions(criteria);
    res.render('admin/dashboard', { withdrawals });
});

router.get('/portfolio', authenticateAdmin, async (req, res, next) => {
    try {
        const investments = await investmentService.list({ include: 'investors' });
        res.render('admin/portfolio', { investments });
    } catch (err) {
        next(err);
    }
});

router.get('/farms', authenticateAdmin, async (req, res, next) => {
    try {
        const farms = await investmentService.getFarms({ include: 'investments' });
        res.render('admin/farms', { farms });
    } catch (err) {
        next(err);
    }
});

router.get('/farms/new', authenticateAdmin, async (req, res) => {
    res.render('admin/new-farm');
});

router.post('/farms', authenticateAdmin, async (req, res, next) => {
    try {
        await investmentService.saveFarm(req);
        res.redirect('/admin/farms');
    } catch (err) {
        next(err);
    }
});

router.get('/edit-farm/:id', authenticateAdmin, async (req, res, next) => {
    try {
        const farm = await investmentService.viewFarm(req.params.id);
        res.render('admin/edit-farm', { farm, title: 'Edit Farm' });
    } catch (err) {
        next(err);
    }
});

router.get('/portfolio/new', authenticateAdmin, async (req, res) => {
    try {
        const farms = await investmentService.getFarms();
        res.render('admin/new-portfolio', { farms });
    } catch (err) {
        next(err);
    }
});

router.get('/edit-portfolio/:id', authenticateAdmin, async (req, res, next) => {
    try {
        const [investment, farms] = await Promise.all([
            investmentService.view(req.params.id),
            investmentService.getFarms()
        ]);
        res.render('admin/edit-portfolio', { investment, farms, title: 'Edit Portfolio' });
    } catch (err) {
        next(err);
    }
});

router.post('/portfolio', authenticateAdmin, async (req, res, next) => {
    try {
        await investmentService.save(req);
        res.redirect('/admin/portfolio');
    } catch (err) {
        next(err);
    }
});

router.get('/transactions', authenticateAdmin, async (req, res, next) => {
    const criteria = {
        attributes: ['id', 'description', 'amount', 'reference', 'status', 'createdAt'],
        include: [
            {
                model: User,
                attributes: ['id', 'fullname']
            },
            {
                model: Investment,
                attributes: ['id', 'investment_name']
            }
        ],
        order: [
            ['createdAt', 'DESC']
        ]
    };
    try {
        const { transactions } = await walletService.fetchTransactions(criteria);
        res.render('admin/transactions', { transactions });
    } catch (err) {
        next(err);
    }
});

router.get('/investors', authenticateAdmin, async (req, res, next) => {
    try {
        const users = await userService.find({
            include: 'UserInvestments',
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.render('admin/members', { users });
    } catch (err) {
        next(err);
    }
});

router.get('/payouts', authenticateAdmin, async (req, res, next) => {
    try {
        const criteria = {
            include: {
                model: User,
                attributes: ['id', 'fullname']
            },
            order: [
                ['createdAt', 'DESC']
            ]
        };
        const withdrawals = await walletService.listWithdrawals(criteria);
        res.render('admin/payouts', { withdrawals });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
