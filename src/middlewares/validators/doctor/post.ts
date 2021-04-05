import {body} from "express-validator";

const validations = [
  body('name').exists().withMessage('Name is required'),
  body('name').if(body('name').exists()).isLength({min: 5}).withMessage('Min length for name is 5 characters'),
  body('specialty').exists().withMessage('Specialty is required'),
  body('specialty').if(body('specialty').exists()).isLength({min: 5}).withMessage('Min length for specialty is 5 characters'),
];

export default validations;