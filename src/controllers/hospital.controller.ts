import { Request, Response, Router } from "express";
import auth_token from '../middlewares/auth/auth.midd';
import Hospital from "../models/hospital";
import { ErrorHandler, handleError } from '../error';
import validator from '../middlewares/validator';
import postHospitalValidations from '../middlewares/validators/hospital/post';
import putHospitalValidations from '../middlewares/validators/hospital/put';
import Doctor from "../models/doctor";

const router = Router();

router.get("/", auth_token, async (req: Request, res: Response) => {
  try {
    const hospitals = await Hospital.find().sort({name: 1});
    return res.status(200).json({
      data: hospitals,
      msj: "List of hospitals"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.get("/:id", auth_token, async (req: Request, res: Response) => {
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      const custom = new ErrorHandler(400, "The hospital does not exist");
      handleError(custom, req, res);
      return;
    }
    return res.status(200).json({
      data: hospital,
      msj: "Hospital info"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.post("/", auth_token, postHospitalValidations, validator, async (req: Request, res: Response) => {
  const { name, address, phone } = req.body;
  try {
    let hospital = await Hospital.findOne({ name });
    if (hospital) {
      const custom = new ErrorHandler(400, "There is a hospital with that name");
      handleError(custom, req, res);
      return;
    }
    hospital = new Hospital({
      name,
      address,
      phone
    });

    await hospital.save();

    res.status(201).json({
      data: { hospital },
      msj: "Hospital created"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.put("/:id", auth_token, putHospitalValidations, validator, async (req: Request, res: Response) => {
  const { name, address, phone, doctors } = req.body;
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      const custom = new ErrorHandler(400, "The hospital does not exist");
      handleError(custom, req, res);
      return;
    }
    
    const hospitalFields: any = {};
    if (name) hospitalFields.name = name;
    if (address) hospitalFields.address = address;
    if (phone) hospitalFields.phone = phone;
    if (doctors) {
      // validate if doctor is not assigned to this hospital
      const doctorExists = hospital.doctors.find(doctor => doctor == doctors[0]._id);
      if (!doctorExists) {
        hospitalFields.doctors = hospital.doctors || [];
        hospitalFields.doctors.push(doctors[0]);
      }
    }

    hospital = await Hospital.findByIdAndUpdate(req.params.id, {$set: hospitalFields}, {new: true});

    res.status(201).json({
      data: { hospital },
      msj: "Hospital updated"
    });
  } catch (err) {
    console.log(err);
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.delete("/:id", auth_token, async (req: Request, res: Response) => {
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      const custom = new ErrorHandler(400, "The hospital does not exist");
      handleError(custom, req, res);
      return;
    }
    await hospital.deleteOne();
    return res.status(200).json({
      data: hospital,
      msj: "Hospital deleted"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.delete("/:id/doctors/:doctorId", auth_token, async (req: Request, res: Response) => {
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      const custom = new ErrorHandler(400, "The hospital does not exist");
      handleError(custom, req, res);
      return;
    }
    
    const hospitalFields: any = {};
    let doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      const custom = new ErrorHandler(400, "The doctor does not exist");
      handleError(custom, req, res);
      return;
    }
    // validate if doctor is assigned to this hospital
    const doctorExists = hospital.doctors.find(hospDoctor => String(hospDoctor) == String(doctor?._id));
    if (doctorExists) {
      hospitalFields.doctors = hospital.doctors.filter(hospDoctor => String(hospDoctor) != String(doctor?._id));
    }

    hospital = await Hospital.findByIdAndUpdate(req.params.id, {$set: hospitalFields}, {new: true});

    res.status(201).json({
      data: { hospital },
      msj: "Hospital updated"
    });
  } catch (err) {
    console.log(err);
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.get("/:id/doctors", auth_token, async (req: Request, res: Response) => {
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      const custom = new ErrorHandler(400, "The hospital does not exist");
      handleError(custom, req, res);
      return;
    }
    const doctors = hospital.doctors;
    return res.status(200).json({
      data: doctors,
      msj: "List of doctors that belongs to this hospital"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

router.post("/:id/doctors", auth_token, async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      const custom = new ErrorHandler(400, "The hospital does not exist");
      handleError(custom, req, res);
      return;
    }
    let doctor = await Doctor.findById(id);
    if (!doctor) {
      const custom = new ErrorHandler(400, "The doctor does not exist");
      handleError(custom, req, res);
      return;
    }

    let hospitalDoctors = hospital.doctors;
    // check if doctor is not already assigned
    if (hospitalDoctors.includes(id)) {
      const custom = new ErrorHandler(400, "The doctor is already assigned to this hospital");
      handleError(custom, req, res);
      return;
    }

    hospitalDoctors.push(id);

    const hospitalFields: any = {};
    hospitalFields.doctors = hospitalDoctors;
    hospital = await Hospital.findByIdAndUpdate(req.params.id, {$set: hospitalFields}, {new: true});

    res.status(201).json({
      data: { hospital },
      msj: "Doctor assigned to the hospital"
    });
  } catch (err) {
    const custom = new ErrorHandler(500, "Server error");
    handleError(custom, req, res);
  }
});

export default router;