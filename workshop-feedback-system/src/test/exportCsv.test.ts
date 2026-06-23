import { describe, it, expect, vi } from 'vitest';
import { exportToCsv } from '../utils/exportCsv';

describe('exportToCsv', () => {
  it('generates valid CSV and triggers download', () => {
    // Mock the global URL and DOM objects
    const mockCreateObjectURL = vi.fn();
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    const mockElement = {
      href: '',
      download: '',
      click: mockClick,
      setAttribute: vi.fn(),
      style: { display: '' }
    } as any;

    vi.spyOn(document, 'createElement').mockReturnValue(mockElement);
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    const data = [
      { name: 'John Doe', age: 30, city: 'New York' },
      { name: 'Jane, Doe', age: 25, city: 'London' }
    ];

    exportToCsv('test_export', data);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('download', 'test_export');
  });
});
