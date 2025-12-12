import router from '@adonisjs/core/services/router'


// Lazy load the controller
const CompanyController = () => import('./company.controller.js')

// Public route for creating a company
router.post('/companies', [CompanyController, 'store'])
router
  
