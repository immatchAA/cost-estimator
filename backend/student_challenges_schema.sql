-- Create student_challenges table for challenge management
CREATE TABLE IF NOT EXISTS student_challenges (
    challenge_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_name VARCHAR(255) NOT NULL,
    challenge_objectives TEXT,
    challenge_instructions TEXT,
    file_url TEXT,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_challenges_teacher_id ON student_challenges(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_challenges_created_at ON student_challenges(created_at);

-- Create storage bucket for challenge files (run this in Supabase dashboard or via SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('student_challenge_files', 'student_challenge_files', true);

-- Add RLS policies
ALTER TABLE student_challenges ENABLE ROW LEVEL SECURITY;

-- Teachers can view, insert, update, and delete their own challenges
CREATE POLICY "Teachers can manage own challenges" ON student_challenges
    FOR ALL USING (teacher_id = auth.uid());

-- Students can view all challenges
CREATE POLICY "Students can view challenges" ON student_challenges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data ->> 'role' = 'student'
        )
    );

-- Also create student_cost_estimates table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_cost_estimates (
    "studentsCostEstimatesID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES student_challenges(challenge_id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_cost_estimate_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_cost_estimate_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "studentsCostEstimatesID" UUID NOT NULL REFERENCES student_cost_estimates("studentsCostEstimatesID") ON DELETE CASCADE,
    cost_category VARCHAR(100),
    material_name VARCHAR(255),
    quantity DECIMAL(10,3),
    unit VARCHAR(50),
    unit_price DECIMAL(10,2),
    amount DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_student_cost_estimates_student_id ON student_cost_estimates(student_id);
CREATE INDEX IF NOT EXISTS idx_student_cost_estimates_challenge_id ON student_cost_estimates(challenge_id);
CREATE INDEX IF NOT EXISTS idx_student_cost_estimate_items_estimate_id ON student_cost_estimate_items("studentsCostEstimatesID");

-- Enable RLS on cost estimates tables
ALTER TABLE student_cost_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_cost_estimate_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for cost estimates
CREATE POLICY "Students can manage own estimates" ON student_cost_estimates
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers can view all estimates" ON student_cost_estimates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data ->> 'role' = 'teacher'
        )
    );

CREATE POLICY "Students can manage own estimate items" ON student_cost_estimate_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM student_cost_estimates 
            WHERE student_cost_estimates."studentsCostEstimatesID" = student_cost_estimate_items."studentsCostEstimatesID"
            AND student_cost_estimates.student_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view all estimate items" ON student_cost_estimate_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data ->> 'role' = 'teacher'
        )
    );
