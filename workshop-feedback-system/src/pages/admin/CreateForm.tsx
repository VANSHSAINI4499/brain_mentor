import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { workshopService } from '../../services/workshopService';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { FormPreview } from '../../components/admin/FormPreview';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { Loader } from '../../components/shared/Loader';
import { generateSlug } from '../../utils/slug';
import { normalizeDate } from '../../utils/date';

const formSchema = z.object({
  workshopName: z.string().min(3, "Workshop name must be at least 3 characters"),
  collegeName: z.string().min(3, "College name must be at least 3 characters"),
  instructorName: z.string().optional(),
  workshopDate: z.string().min(1, "Date is required"),
  workshopTime: z.string().min(1, "Time is required"),
  duration: z.string().optional(),
  description: z.string().optional(),
  id: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  status: z.enum(['draft', 'active', 'inactive']),
  instructions: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const CreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'draft',
      instructions: '',
    }
  });

  const formValues = watch();

  // Auto-generate slug from Workshop Name if we're not editing and haven't manually touched slug too much
  useEffect(() => {
    if (!editId && formValues.workshopName) {
      const slug = generateSlug(formValues.workshopName);
      setValue('id', slug, { shouldValidate: true });
    }
  }, [formValues.workshopName, editId, setValue]);

  useEffect(() => {
    if (editId) {
      workshopService.getWorkshop(editId).then((workshop) => {
        if (workshop) {
          const dateObj = normalizeDate(workshop.dateTime);
          setValue('workshopName', workshop.workshopName);
          setValue('collegeName', workshop.collegeName);
          setValue('instructorName', workshop.instructorName || '');
          setValue('workshopDate', dateObj.toISOString().split('T')[0]);
          setValue('workshopTime', dateObj.toTimeString().substring(0, 5));
          setValue('duration', workshop.duration || '');
          setValue('description', workshop.description || '');
          setValue('id', workshop.id);
          setValue('status', workshop.status);
          setValue('instructions', workshop.instructions);
        } else {
          toast.error("Workshop not found");
          navigate('/admin/dashboard');
        }
        setLoading(false);
      });
    }
  }, [editId, setValue, navigate]);

  const onSubmit = async (data: FormData, isDraft: boolean) => {
    setSubmitting(true);
    try {
      const finalStatus = isDraft ? 'draft' : 'active';
      const [year, month, day] = data.workshopDate.split('-');
      const [hours, minutes] = data.workshopTime.split(':');
      const dateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));

      const payload = {
        id: data.id,
        workshopName: data.workshopName,
        collegeName: data.collegeName,
        instructorName: data.instructorName,
        duration: data.duration,
        description: data.description,
        instructions: data.instructions || '',
        status: finalStatus as any,
        dateTime: dateTime as any, // Using our mock service Timestamp coercion
      };

      if (editId) {
        await workshopService.updateWorkshop(editId, payload);
        toast.success("Workshop updated successfully!");
      } else {
        await workshopService.createWorkshop(payload);
        toast.success(`Workshop ${isDraft ? 'saved as draft' : 'published'} successfully!`);
      }
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to save workshop");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading workshop..." />;
  }

  // Derived Preview Data
  const previewData = {
    ...formValues,
    dateTime: (formValues.workshopDate && formValues.workshopTime) 
      ? new Date(`${formValues.workshopDate}T${formValues.workshopTime}`)
      : new Date(),
    instructions: formValues.instructions || ''
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-slate-800">
            {editId ? 'Edit Workshop' : 'Create New Form'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          <Button 
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Publish Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-8"
        >
          {/* Section: Public Form Configuration */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Public Configuration</h3>
              <p className="text-sm text-slate-500">Define the URL and availability status.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Form Slug"
                  {...register('id')}
                  error={errors.id?.message}
                  placeholder="e.g. react-masterclass-2026"
                />
                <p className="text-xs text-slate-400 mt-1">Unique URL identifier. Generated automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="active">Active (Public)</option>
                  <option value="inactive">Inactive (Closed)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section: Workshop Information */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Workshop Details</h3>
              <p className="text-sm text-slate-500">Core information displayed to students.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Input
                  label="Workshop Name"
                  {...register('workshopName')}
                  error={errors.workshopName?.message}
                  placeholder="e.g. React & Firebase Masterclass"
                />
              </div>
              <div>
                <Input
                  label="College Name"
                  {...register('collegeName')}
                  error={errors.collegeName?.message}
                  placeholder="e.g. State University"
                />
              </div>
              <div>
                <Input
                  label="Instructor Name"
                  {...register('instructorName')}
                  error={errors.instructorName?.message}
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <Input
                  label="Workshop Date"
                  type="date"
                  {...register('workshopDate')}
                  error={errors.workshopDate?.message}
                />
              </div>
              <div>
                <Input
                  label="Workshop Time"
                  type="time"
                  {...register('workshopTime')}
                  error={errors.workshopTime?.message}
                />
              </div>
              <div>
                <Input
                  label="Duration"
                  {...register('duration')}
                  error={errors.duration?.message}
                  placeholder="e.g. 2 Hours, 1 Day"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Brief summary of the workshop..."
                />
              </div>
            </div>
          </section>

          {/* Section: Instructions */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Instructions</h3>
              <p className="text-sm text-slate-500">Provide pre-requisites and setup instructions.</p>
            </div>
            
            <Controller
              name="instructions"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </section>
        </motion.div>

        {/* Live Preview Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 sticky top-6"
        >
          <FormPreview data={previewData} />
        </motion.div>
      </div>
    </div>
  );
};

export default CreateForm;
