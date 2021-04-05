import {body} from "express-validator";

const validations = [
  body('name').exists().withMessage('Name is required'),
  body('name').if(body('name').exists()).isLength({min: 5}).withMessage('Min length for name is 5 characters'),
  body('address').exists().withMessage('Address is required'),
  body('address').if(body('address').exists()).isLength({min: 5}).withMessage('Min length for address is 5 characters'),
  body('phone').exists().withMessage('Phone is required'),
  body('phone').if(body('phone').exists()).isLength({min: 5}).withMessage('Min length for phone is 5 characters'),
];

export default validations;