import React, { useEffect } from 'react';

const STAGES = ['Awareness', 'Consideration', 'Decision', 'Service', 'Loyalty'];
const ROWS = [
  'Customer Actions',
  'Touchpoints',
  'Customer Experience',
  'Pain Points',
  'KPIs',
  'Business Goals',
  'Team(s) Involved'
];

export default function UserJourneyMap({ content, onUpdate }) {
  // Initialize grid if not present
  const grid = content?.grid || {};

  useEffect(() => {
    if (!content?.grid) {
      const initialGrid = {};
      ROWS.forEach(row => {
        initialGrid[row] = {};
        STAGES.forEach(stage => {
          initialGrid[row][stage] = '';
        });
      });
      onUpdate({ ...content, grid: initialGrid });
    }
  }, []);

  const handleCellChange = (row, stage, value) => {
    const newGrid = { ...grid };
    if (!newGrid[row]) newGrid[row] = {};
    newGrid[row][stage] = value;
    onUpdate({ ...content, grid: newGrid });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 table-fixed">
          <thead>
            <tr>
              <th className="border border-gray-300 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-800 dark:text-white font-bold text-left w-48">Stage</th>
              {STAGES.map(stage => (
                <th key={stage} className="border border-gray-300 dark:border-gray-700 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-bold">
                  {stage}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row}>
                <td className="border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-200 font-medium">
                  {row}
                </td>
                {STAGES.map(stage => (
                  <td key={stage} className="border border-gray-300 dark:border-gray-700 p-1 bg-white dark:bg-gray-900">
                    <textarea
                      className="w-full h-24 p-2 text-sm border-none resize-none focus:ring-2 focus:ring-blue-500 rounded bg-transparent text-gray-900 dark:text-white"
                      value={grid[row]?.[stage] || ''}
                      onChange={(e) => handleCellChange(row, stage, e.target.value)}
                      placeholder="..."
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
