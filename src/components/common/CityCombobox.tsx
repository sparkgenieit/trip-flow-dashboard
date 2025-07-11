import React, { useMemo, useState } from 'react';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface City {
  id: number;
  name: string;
  state: string;
}

interface CityComboboxProps {
  cities: City[];
  value: string;
  onChange: (cityId: string) => void;
  placeholder?: string;
}

const CityCombobox: React.FC<CityComboboxProps> = ({ cities, value, onChange, placeholder }) => {
  const selectedCity = useMemo(
    () => cities.find((c) => String(c.id) === value),
    [value, cities]
  );

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCities = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return cities.filter((city) => city.name.toLowerCase().includes(lower));
  }, [searchTerm, cities]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : placeholder || 'Select city'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto">
        <Command>
          <CommandInput placeholder="Search city..." onValueChange={setSearchTerm} />
          <CommandList>
            {filteredCities.map((city) => (
              <CommandItem
                key={city.id}
                value={city.name} // ✅ value only city name
                onSelect={() => onChange(String(city.id))}
              >
                {city.name}, {city.state}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CityCombobox;
