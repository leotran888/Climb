-- Them de IELTS Writing vao database
-- Chay trong Supabase SQL Editor

INSERT INTO writing_prompts (task_type, title, prompt_text, image_description, time_limit) VALUES

-- ===== TASK 2 =====
(
  'task2', 'Social Media and Privacy',
  'Social media platforms collect large amounts of personal data from their users. Some people think this is a serious threat to privacy, while others believe the benefits of social media outweigh the risks.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Urban vs Rural Living',
  'In many countries, people are moving from rural areas to cities. Some people think this trend has negative effects on both cities and rural areas.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Advantages of Learning Foreign Languages',
  'Some experts believe that it is better for children to begin learning a foreign language at primary school rather than secondary school.

Do the advantages of this outweigh the disadvantages?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Space Exploration and Funding',
  'Some people think that space exploration is a waste of money and that there are more urgent needs that governments should spend money on.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Fast Food and Health',
  'In many countries, the number of overweight people is increasing. Some people say that governments should be responsible for controlling this situation by taxing junk food. Others disagree with this.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Art and Music in Schools',
  'Some people think that art and music are as important as academic subjects, such as maths and science, and should receive equal time in school curricula.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Working from Home',
  'More and more people are working from home due to advances in technology. Some people think this trend has many benefits, while others believe it creates new problems.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Tourism and Local Culture',
  'International tourism has brought great benefits to many places. However, some people think that tourism creates problems for local people and damages local culture.

Do the disadvantages of international tourism outweigh the advantages?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Elderly Care',
  'In many countries, the average life expectancy is increasing. Some people consider this to be a positive development, while others worry about its negative consequences.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Advertising Influence on Children',
  'Advertising aimed at children should be strictly controlled because children are too young to understand that they are being influenced.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),

-- ===== ACADEMIC TASK 1 =====
(
  'academic_task1', 'Line Graph: Internet Users',
  'The graph below shows the number of internet users in different regions of the world from 2000 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
  'Line graph showing internet users (in millions) from 2000-2020.
Asia: grew rapidly from 100M (2000) to 2,300M (2020).
Europe: steady growth from 105M to 727M.
North America: grew from 108M to 328M.
Latin America: grew from 18M to 467M.
Africa: slow start, grew from 4M to 526M by 2020.',
  1200
),
(
  'academic_task1', 'Pie Charts: Household Spending',
  'The pie charts below show how households in two different countries spent their money in 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
  'Pie chart – Country A (developed): Housing 35%, Food 15%, Transport 14%, Healthcare 12%, Entertainment 10%, Education 8%, Other 6%.
Pie chart – Country B (developing): Food 42%, Housing 20%, Transport 10%, Education 12%, Healthcare 8%, Entertainment 4%, Other 4%.',
  1200
),
(
  'academic_task1', 'Table: University Enrolment',
  'The table below shows the number of students enrolled in four university faculties in two different years.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
  'Table showing student enrolment by faculty:
                  2010      2020
Engineering:      4,200     8,750
Business:         6,100     9,200
Arts & Humanities:3,800     3,200
Science:          2,900     6,400
Total:           17,000    27,550',
  1200
),
(
  'academic_task1', 'Bar Chart: CO2 Emissions by Country',
  'The chart below shows CO2 emissions per capita (in tonnes) for five countries in 1990 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
  'Bar chart showing CO2 emissions per capita (tonnes):
USA: 19.3 (1990) → 14.2 (2020). Decrease.
China: 2.2 (1990) → 7.4 (2020). Large increase.
Germany: 12.3 (1990) → 7.9 (2020). Decrease.
India: 0.8 (1990) → 1.9 (2020). Increase.
Brazil: 1.5 (1990) → 2.2 (2020). Slight increase.',
  1200
),
(
  'academic_task1', 'Process Diagram: Recycling Paper',
  'The diagram below shows the process of recycling paper.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
  'Process diagram (8 stages):
1. Collection – Used paper collected from homes and offices.
2. Sorting – Paper sorted by type (newspaper, cardboard, office paper).
3. Shredding – Paper cut into small pieces.
4. Pulping – Shredded paper mixed with water and chemicals to form pulp.
5. Cleaning – Pulp filtered to remove staples, plastic, and ink.
6. De-inking – Ink removed using air bubbles (flotation process).
7. Bleaching – Pulp bleached to make it white.
8. Rolling & Drying – Pulp spread on rollers, dried, and cut into new paper sheets.',
  1200
),

-- ===== GENERAL TASK 1 =====
(
  'general_task1', 'Letter: Job Application',
  'You have seen a job advertisement for a position at an international company. You have decided to apply.

Write a letter to the company. In your letter:
• Explain why you are interested in this position
• Describe your relevant experience and skills
• Ask about the application process

Write at least 150 words. You do NOT need to write any addresses. Begin your letter as follows: Dear Sir or Madam,',
  NULL, 1200
),
(
  'general_task1', 'Letter: Returning Faulty Product',
  'You bought a product from an online shop, but when it arrived, it was damaged and does not work properly.

Write a letter to the company. In your letter:
• Describe what you bought and when
• Explain the problem with the product
• Say what you would like the company to do

Write at least 150 words. You do NOT need to write any addresses. Begin your letter as follows: Dear Sir or Madam,',
  NULL, 1200
),
(
  'general_task1', 'Letter: Invitation to Friend',
  'Your friend who lives in another country is coming to visit you. You want to show them around your city and plan some activities.

Write a letter to your friend. In your letter:
• Tell them how excited you are about their visit
• Suggest some activities you could do together
• Ask about any preferences or things they would like to do

Write at least 150 words. Begin your letter as follows: Dear [friend''s name],',
  NULL, 1200
),
(
  'general_task1', 'Letter: Request for Information',
  'You are interested in doing a short language course in an English-speaking country. You have seen an advertisement for a language school.

Write a letter to the school. In your letter:
• Ask about the courses available and their costs
• Ask about accommodation options
• Ask what you need to do to apply

Write at least 150 words. You do NOT need to write any addresses. Begin your letter as follows: Dear Sir or Madam,',
  NULL, 1200
),
(
  'general_task1', 'Letter: Neighbour Complaint',
  'You are having problems with a neighbour. The noise from their home is affecting your sleep and daily life.

Write a letter to your neighbour. In your letter:
• Describe the problem
• Explain how it is affecting you
• Suggest a solution

Write at least 150 words. Begin your letter as follows: Dear [neighbour''s name],',
  NULL, 1200
)

ON CONFLICT DO NOTHING;
