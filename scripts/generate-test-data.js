#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { program } from 'commander';

// Parse command line arguments
program
  .option('-r, --records <number>', 'number of records to generate', '100000')
  .option('-o, --output <path>', 'output directory', 'test/fixtures')
  .parse();

const options = program.opts();

// Generate random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random duration in minutes (30-120)
function randomDuration() {
  return Math.floor(Math.random() * (120 - 30 + 1)) + 30;
}

// List of class types
const classTypes = [
  'Yoga', 'Pilates', 'Spin', 'HIIT', 'Strength Training', 
  'Boxing', 'Kickboxing', 'Zumba', 'CrossFit', 'Boot Camp'
];

// List of instructors
const instructors = [
  'John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis',
  'James Brown', 'Lisa Anderson', 'David Miller', 'Jennifer White',
  'Robert Taylor', 'Maria Garcia'
];

// List of difficulty levels
const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

// List of locations
const locations = [
  'Main Studio', 'Spin Room', 'Yoga Studio', 'Training Zone',
  'CrossFit Box', 'Outdoor Area', 'Pool Area', 'Boxing Ring'
];

// Generate large nested object with class details
function generateClassDetails() {
  return {
    equipment: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
      name: ['Mat', 'Weights', 'Resistance Bands', 'Kettle Bells', 'Jump Rope'][Math.floor(Math.random() * 5)],
      required: Math.random() > 0.5,
      quantity: Math.floor(Math.random() * 20) + 1
    })),
    prerequisites: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
      classType: classTypes[Math.floor(Math.random() * classTypes.length)],
      minimumClasses: Math.floor(Math.random() * 5) + 1
    })),
    certification: Math.random() > 0.7 ? {
      name: ['CPR', 'First Aid', 'Personal Trainer', 'Yoga Alliance'][Math.floor(Math.random() * 4)],
      validUntil: randomDate(new Date(), new Date(2025, 11, 31)),
      certificationNumber: Math.random().toString(36).substring(2, 15)
    } : null
  };
}

async function generateTestData() {
  const startDate = new Date(2024, 0, 1);
  const endDate = new Date(2024, 11, 31);
  const records = [];

  console.log(`Generating ${options.records} test records...`);
  
  // Generate records
  for (let i = 0; i < options.records; i++) {
    if (i % 10000 === 0) {
      console.log(`Generated ${i} records...`);
    }

    const classDate = randomDate(startDate, endDate);
    const classType = classTypes[Math.floor(Math.random() * classTypes.length)];
    
    const record = {
      id: `class_${i}`,
      type: classType,
      date: classDate.toISOString(),
      startTime: `${Math.floor(Math.random() * 14) + 6}:${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]}`,
      duration: randomDuration(),
      instructor: instructors[Math.floor(Math.random() * instructors.length)],
      difficulty: difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      maxCapacity: Math.floor(Math.random() * 20) + 10,
      currentBookings: Math.floor(Math.random() * 30),
      waitlistEnabled: Math.random() > 0.5,
      waitlistCapacity: Math.floor(Math.random() * 10),
      category: ['Cardio', 'Strength', 'Flexibility', 'Hybrid'][Math.floor(Math.random() * 4)],
      tags: Array.from(
        { length: Math.floor(Math.random() * 5) + 1 },
        () => ['Morning', 'Evening', 'Weekend', 'Popular', 'New', 'Limited', 'Special'][Math.floor(Math.random() * 7)]
      ),
      details: generateClassDetails(),
      cancellationPolicy: {
        deadline: Math.floor(Math.random() * 24) + 1,
        penaltyFee: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0
      },
      ratings: Array.from(
        { length: Math.floor(Math.random() * 50) },
        () => ({
          score: Math.floor(Math.random() * 5) + 1,
          comment: Math.random() > 0.7 ? 'Lorem ipsum dolor sit amet'.repeat(Math.floor(Math.random() * 3) + 1) : '',
          date: randomDate(new Date(2023, 0, 1), new Date()).toISOString()
        })
      ),
      lastModified: new Date().toISOString(),
      status: ['Scheduled', 'Cancelled', 'Full', 'Available'][Math.floor(Math.random() * 4)]
    };

    // Add historical attendance data
    if (classDate < new Date()) {
      record.attendance = {
        registered: Math.floor(Math.random() * record.maxCapacity),
        attended: Math.floor(Math.random() * record.maxCapacity),
        waitlist: Math.floor(Math.random() * 5),
        checkedIn: Math.floor(Math.random() * record.maxCapacity)
      };
    }

    records.push(record);
  }

  // Create output directory if it doesn't exist
  await fs.mkdir(options.output, { recursive: true });

  // Write data in chunks to avoid memory issues
  const chunkSize = 10000;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const filename = path.join(options.output, `test_data_${Math.floor(i / chunkSize)}.json`);
    await fs.writeFile(filename, JSON.stringify(chunk, null, 2));
    console.log(`Wrote chunk to ${filename}`);
  }

  // Generate an index file
  const indexData = {
    totalRecords: records.length,
    chunks: Math.ceil(records.length / chunkSize),
    generated: new Date().toISOString()
  };
  await fs.writeFile(
    path.join(options.output, 'index.json'),
    JSON.stringify(indexData, null, 2)
  );

  console.log('Test data generation complete!');
}

generateTestData().catch(console.error);