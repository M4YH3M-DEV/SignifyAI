import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface GestureMapping {
  [key: string]: {
    letter?: string;
    name?: string;
    image_path: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const aslGloss = body.asl_gloss;

    if (!aslGloss) {
      return NextResponse.json(
        { error: 'asl_gloss is required' },
        { status: 400 }
      );
    }

    // Load gesture mapping
    const mappingPath = path.join(
      process.cwd(),
      'data',
      'gesture_mapping.json'
    );
    const mappingData = fs.readFileSync(mappingPath, 'utf-8');
    const gestureMapping: GestureMapping = JSON.parse(mappingData);

    // Parse the ASL gloss and map to gestures
    const words = aslGloss.trim().split(/\s+/);
    const gestureSequence = [];

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      const upperWord = word.toUpperCase();

      // Try to find the word in gesture mapping
      if (gestureMapping[upperWord]) {
        gestureSequence.push({
          letter: gestureMapping[upperWord].letter || gestureMapping[upperWord].name,
          image_path: gestureMapping[upperWord].image_path,
          type: 'sign',
          isSpace: false,
        });
      } else {
        // Fallback: fingerspell letter by letter
        for (const letter of upperWord) {
          if (gestureMapping[letter]) {
            gestureSequence.push({
              letter: letter,
              image_path: gestureMapping[letter].image_path,
              type: 'fingerspell',
              isSpace: false,
            });
          }
        }
      }

      // Add space after each word EXCEPT the last word
      if (wordIndex < words.length - 1 && gestureMapping['Nothing']) {
        gestureSequence.push({
          letter: '',
          image_path: gestureMapping['Nothing'].image_path,
          type: 'space',
          isSpace: true,
        });
      }
    }

    return NextResponse.json({
      gesture_sequence: gestureSequence,
      original_gloss: aslGloss,
    });
  } catch (error) {
    console.error('Error in getSignVisual:', error);
    return NextResponse.json(
      { error: 'Failed to process gesture mapping' },
      { status: 500 }
    );
  }
}
