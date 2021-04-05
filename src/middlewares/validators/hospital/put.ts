import {body} from "express-validator";

const validations = [
  body('name').if(body('name').exists()).isLength({min: 5}).withMessage('Min length for name is 5 characters'),
  body('address').if(body('address').exists()).isLength({min: 5}).withMessage('Min length for address is 5 characters'),
  body('phone').if(body('phone').exists()).isLength({min: 5}).withMessage('Min length for phone is 5 characters'),
];

export default validations;