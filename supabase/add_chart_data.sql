-- Them cot chart_data vao writing_prompts
ALTER TABLE writing_prompts ADD COLUMN IF NOT EXISTS chart_data JSONB;

-- Bar Chart: Energy Sources (de cu tu fix.sql)
UPDATE writing_prompts SET chart_data = '{
  "type": "bar",
  "title": "Energy Sources in a Country: 1990 vs 2020 (%)",
  "yLabel": "Percentage (%)",
  "series": ["1990", "2020"],
  "colors": ["#4f86c6", "#f59e0b"],
  "categories": ["Coal", "Oil", "Natural Gas", "Renewables"],
  "values": [[45, 30, 15, 10], [25, 25, 20, 30]]
}'::jsonb
WHERE title = 'Bar Chart: Energy Sources';

-- Line Graph: Internet Users
UPDATE writing_prompts SET chart_data = '{
  "type": "line",
  "title": "Internet Users by Region (millions), 2000–2020",
  "xLabel": "Year",
  "yLabel": "Users (millions)",
  "xValues": [2000, 2005, 2010, 2015, 2020],
  "series": [
    {"label": "Asia",          "color": "#3b82f6", "values": [100, 400,  900, 1600, 2300]},
    {"label": "Europe",        "color": "#10b981", "values": [105, 250,  420,  580,  727]},
    {"label": "N. America",    "color": "#f59e0b", "values": [108, 185,  245,  295,  328]},
    {"label": "Latin America", "color": "#8b5cf6", "values": [18,   60,  150,  300,  467]},
    {"label": "Africa",        "color": "#ef4444", "values": [4,    15,   80,  250,  526]}
  ]
}'::jsonb
WHERE title = 'Line Graph: Internet Users';

-- Pie Charts: Household Spending
UPDATE writing_prompts SET chart_data = '{
  "type": "pie",
  "title": "Household Spending by Category, 2020 (%)",
  "charts": [
    {
      "label": "Country A (Developed)",
      "segments": [
        {"label": "Housing",       "value": 35, "color": "#3b82f6"},
        {"label": "Food",          "value": 15, "color": "#10b981"},
        {"label": "Transport",     "value": 14, "color": "#f59e0b"},
        {"label": "Healthcare",    "value": 12, "color": "#ef4444"},
        {"label": "Entertainment", "value": 10, "color": "#8b5cf6"},
        {"label": "Education",     "value": 8,  "color": "#ec4899"},
        {"label": "Other",         "value": 6,  "color": "#6b7280"}
      ]
    },
    {
      "label": "Country B (Developing)",
      "segments": [
        {"label": "Food",          "value": 42, "color": "#10b981"},
        {"label": "Housing",       "value": 20, "color": "#3b82f6"},
        {"label": "Education",     "value": 12, "color": "#ec4899"},
        {"label": "Transport",     "value": 10, "color": "#f59e0b"},
        {"label": "Healthcare",    "value": 8,  "color": "#ef4444"},
        {"label": "Entertainment", "value": 4,  "color": "#8b5cf6"},
        {"label": "Other",         "value": 4,  "color": "#6b7280"}
      ]
    }
  ]
}'::jsonb
WHERE title = 'Pie Charts: Household Spending';

-- Table: University Enrolment
UPDATE writing_prompts SET chart_data = '{
  "type": "table",
  "title": "Number of Students Enrolled by Faculty",
  "headers": ["Faculty", "2010", "2020", "Change"],
  "rows": [
    ["Engineering",       "4,200",  "8,750",  "+4,550"],
    ["Business",          "6,100",  "9,200",  "+3,100"],
    ["Arts & Humanities", "3,800",  "3,200",  "-600"],
    ["Science",           "2,900",  "6,400",  "+3,500"],
    ["Total",            "17,000", "27,550", "+10,550"]
  ]
}'::jsonb
WHERE title = 'Table: University Enrolment';

-- Bar Chart: CO2 Emissions by Country
UPDATE writing_prompts SET chart_data = '{
  "type": "bar",
  "title": "CO₂ Emissions per Capita (tonnes): 1990 vs 2020",
  "yLabel": "Tonnes per capita",
  "series": ["1990", "2020"],
  "colors": ["#64748b", "#ef4444"],
  "categories": ["USA", "China", "Germany", "India", "Brazil"],
  "values": [[19.3, 2.2, 12.3, 0.8, 1.5], [14.2, 7.4, 7.9, 1.9, 2.2]]
}'::jsonb
WHERE title = 'Bar Chart: CO2 Emissions by Country';

-- Process Diagram: Recycling Paper
UPDATE writing_prompts SET chart_data = '{
  "type": "process",
  "title": "The Process of Recycling Paper",
  "steps": [
    {"number": 1, "label": "Collection",     "description": "Used paper collected from homes and offices"},
    {"number": 2, "label": "Sorting",        "description": "Sorted by type: newspaper, cardboard, office paper"},
    {"number": 3, "label": "Shredding",      "description": "Paper cut into small pieces"},
    {"number": 4, "label": "Pulping",        "description": "Mixed with water and chemicals to form pulp"},
    {"number": 5, "label": "Cleaning",       "description": "Filtered to remove staples, plastic, and ink"},
    {"number": 6, "label": "De-inking",      "description": "Ink removed using air bubbles (flotation)"},
    {"number": 7, "label": "Bleaching",      "description": "Pulp bleached to make it white"},
    {"number": 8, "label": "Rolling & Dry",  "description": "Spread on rollers, dried, and cut into sheets"}
  ]
}'::jsonb
WHERE title = 'Process Diagram: Recycling Paper';
