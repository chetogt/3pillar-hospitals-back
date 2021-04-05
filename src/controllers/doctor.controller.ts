import { Request, Response, Router } from "express";
import auth_token from '../middlewares/auth/auth.midd';
import Doctor from "../models/doctor";
import { ErrorHandler, handleError } from '../error';
import validator from '../middlewares/validator';
import postDoctorValidations from '../middlewares/validators/doctor/post';

const router = Router();

router.get("/", auth_token, async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find().sort({name: 1});
    return res.status(200).json({
      data: doctors,
      msj: "List of doctors"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.get("/:id", auth_token, async (req: Request, res: Response) => {
  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      const custom = new ErrorHandler(400, "The doctor does not exist");
      handleError(custom, req, res);
      return;
    }
    return res.status(200).json({
      data: doctor,
      msj: "Doctor info"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.post("/", auth_token, postDoctorValidations, validator, async (req: Request, res: Response) => {
  const { name, specialty } = req.body;
  try {
    let doctor = new Doctor({
      name,
      specialty
    });

    await doctor.save();

    res.status(201).json({
      data: { doctor },
      msj: "Doctor created"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.put("/:id", auth_token, postDoctorValidations, validator, async (req: Request, res: Response) => {
  const { name, specialty } = req.body;
  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      const custom = new ErrorHandler(400, "The doctor does not exist");
      handleError(custom, req, res);
      return;
    }
    
    const doctorFields: any = {};
    if (name) doctorFields.name = name;
    if (specialty) doctorFields.specialty = specialty;

    doctor = await Doctor.findByIdAndUpdate(req.params.id, {$set: doctorFields}, {new: true});

    res.status(201).json({
      data: { doctor },
      msj: "Doctor updated"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.delete("/:id", auth_token, async (req: Request, res: Response) => {
  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      const custom = new ErrorHandler(400, "The doctor does not exist");
      handleError(custom, req, res);
      return;
    }
    await doctor.deleteOne();
    return res.status(200).json({
      data: doctor,
      msj: "Doctor deleted"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

export default router;