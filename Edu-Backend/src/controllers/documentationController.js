import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/multer.js';
import Documentation from '../models/Documentation.js';
import Project from '../models/Project.js';

// GET /api/projects/:id/documentation — latest version of each doc type only
export const getDocumentation = async (req, res) => {
  try {
    const docs = await Documentation.find({ projectId: req.params.id, isLatest: true })
      .populate('uploadedBy', 'fullName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/projects/:id/documentation/history — full version history
export const getDocumentationHistory = async (req, res) => {
  try {
    const docs = await Documentation.find({ projectId: req.params.id })
      .populate('uploadedBy', 'fullName')
      .populate('replacedBy', 'name version')
      .sort({ documentType: 1, version: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Multer + Cloudinary upload middleware
export const uploadDocFile = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next();

    cloudinary.uploader.upload(
      req.file.path,
      { resource_type: 'raw', folder: 'project-hub/documentation' },
      (uploadErr, result) => {
        if (uploadErr) {
          console.error('Cloudinary upload error:', uploadErr.message);
          return next();
        }
        req.file = { ...req.file, secure_url: result.secure_url };
        next();
      }
    );
  });
};

// POST /api/projects/:id/documentation
export const addDocumentation = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (
      req.user.role === 'student' &&
      project.studentId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { documentType, name, url: bodyUrl } = req.body;

    // Links (code_link, demo_link) come as plain URL in body; files via Cloudinary
    const isLink = documentType === 'code_link' || documentType === 'demo_link';
    const fileUrl = isLink ? bodyUrl : req.file?.secure_url ?? req.file?.path;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File or URL required' });
    }

    // Find the current latest version of the same document type for this project
    const prevDoc = await Documentation.findOne({
      projectId: req.params.id,
      documentType: documentType || 'other',
      isLatest: true,
    });

    const nextVersion = prevDoc ? prevDoc.version + 1 : 1;

    const doc = await Documentation.create({
      projectId:    req.params.id,
      documentType: documentType || 'other',
      name:         name || req.file?.originalname || 'Document',
      url:          fileUrl,
      size:         req.file?.size || 0,
      uploadedBy:   req.user._id,
      version:      nextVersion,
      isLatest:     true,
    });

    // Mark the previous version as superseded
    if (prevDoc) {
      prevDoc.isLatest   = false;
      prevDoc.replacedBy = doc._id;
      await prevDoc.save();
    }

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/projects/:id/documentation/:docId
export const deleteDocumentation = async (req, res) => {
  try {
    const doc = await Documentation.findById(req.params.docId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (
      req.user.role === 'student' &&
      doc.uploadedBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/projects/:id/documentation/:docId/status — teacher/admin only
export const updateDocumentationStatus = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const doc = await Documentation.findByIdAndUpdate(
      req.params.docId,
      { status },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/projects/:id/links — save codeLink / demoLink as Documentation entries (upsert)
export const saveProjectLinks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (
      req.user.role === 'student' &&
      project.studentId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { codeLink, demoLink } = req.body;
    const results = [];

    if (codeLink !== undefined) {
      const existing = await Documentation.findOne({ projectId: req.params.id, documentType: 'code_link' });
      if (existing) {
        if (codeLink) {
          existing.url = codeLink;
          await existing.save();
          results.push(existing);
        } else {
          await existing.deleteOne();
        }
      } else if (codeLink) {
        const doc = await Documentation.create({
          projectId: req.params.id,
          documentType: 'code_link',
          name: 'Code Repository',
          url: codeLink,
          uploadedBy: req.user._id,
        });
        results.push(doc);
      }
    }

    if (demoLink !== undefined) {
      const existing = await Documentation.findOne({ projectId: req.params.id, documentType: 'demo_link' });
      if (existing) {
        if (demoLink) {
          existing.url = demoLink;
          await existing.save();
          results.push(existing);
        } else {
          await existing.deleteOne();
        }
      } else if (demoLink) {
        const doc = await Documentation.create({
          projectId: req.params.id,
          documentType: 'demo_link',
          name: 'Live Demo',
          url: demoLink,
          uploadedBy: req.user._id,
        });
        results.push(doc);
      }
    }

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
