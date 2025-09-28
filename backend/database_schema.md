# Database Schema for Class Management and Challenges

## Required Tables

### 1. `classes` table

```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name VARCHAR(255) NOT NULL,
    description TEXT,
    class_key VARCHAR(8) UNIQUE NOT NULL,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `class_enrollments` table

```sql
CREATE TABLE class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);
```

### 3. `users` table (if not already exists)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. `student_challenges` table

```sql
CREATE TABLE student_challenges (
    challenge_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_name VARCHAR(255) NOT NULL,
    challenge_objectives TEXT,
    challenge_instructions TEXT,
    file_url TEXT,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. `student_cost_estimates` table

```sql
CREATE TABLE student_cost_estimates (
    "studentsCostEstimatesID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES student_challenges(challenge_id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. `student_cost_estimate_items` table

```sql
CREATE TABLE student_cost_estimate_items (
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
```

## Indexes

```sql
-- For faster class key lookups
CREATE INDEX idx_classes_class_key ON classes(class_key);

-- For faster teacher class queries
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);

-- For faster student enrollment queries
CREATE INDEX idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_class_id ON class_enrollments(class_id);
```

## Row Level Security (RLS) Policies

### Classes table

```sql
-- Teachers can view their own classes
CREATE POLICY "Teachers can view own classes" ON classes
    FOR SELECT USING (teacher_id = auth.uid());

-- Teachers can insert their own classes
CREATE POLICY "Teachers can create classes" ON classes
    FOR INSERT WITH CHECK (teacher_id = auth.uid());

-- Teachers can update their own classes
CREATE POLICY "Teachers can update own classes" ON classes
    FOR UPDATE USING (teacher_id = auth.uid());

-- Teachers can delete their own classes
CREATE POLICY "Teachers can delete own classes" ON classes
    FOR DELETE USING (teacher_id = auth.uid());
```

### Class enrollments table

```sql
-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON class_enrollments
    FOR SELECT USING (student_id = auth.uid());

-- Students can join classes
CREATE POLICY "Students can join classes" ON class_enrollments
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Teachers can view enrollments for their classes
CREATE POLICY "Teachers can view class enrollments" ON class_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = class_enrollments.class_id
            AND classes.teacher_id = auth.uid()
        )
    );
```

## Setup Instructions

1. Run the SQL commands above in your Supabase SQL editor
2. Enable RLS on both tables:
   ```sql
   ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
   ```
3. Create the policies as shown above
4. Test the functionality with sample data
