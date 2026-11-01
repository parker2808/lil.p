import { readFileSync } from 'node:fs';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './badge';
import { Button } from './button';
import { Card, CardHeader } from './card';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './sidebar';
import { Tabs, TabsList, TabsTrigger } from './tabs';

describe('redesign variants', () => {
  it('uses the public button surface without changing the default button', () => {
    render(
      <>
        <Button surface="public">Public</Button>
        <Button>Default</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Public' })).toHaveClass('min-h-10');
    expect(screen.getByRole('button', { name: 'Default' })).not.toHaveClass('min-h-10');
  });

  it('uses the admin card surface and header border', () => {
    render(
      <Card surface="admin" data-testid="card">
        <CardHeader surface="admin" data-testid="header" />
      </Card>,
    );

    expect(screen.getByTestId('card')).toHaveClass('rounded-[14px]', 'shadow-none');
    expect(screen.getByTestId('header')).toHaveClass('border-b', 'py-3.5');
  });

  it('keeps badge and tab styles in their primitive variants', () => {
    render(
      <>
        <Badge variant="success">Published</Badge>
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
          </TabsList>
        </Tabs>
      </>,
    );

    expect(screen.getByText('Published')).toHaveClass('bg-success-subtle');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveClass('data-[state=active]:bg-card');
  });

  it('keeps the compact sidebar menu button styles in its primitive', () => {
    render(
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton href="#a" active>
            Active
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton href="#b">Idle</SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>,
    );

    expect(screen.getByRole('link', { name: 'Active' })).toHaveClass(
      'h-8',
      'border-l-2',
      'border-sidebar-primary',
    );
    expect(screen.getByRole('link', { name: 'Idle' })).toHaveClass(
      'h-8',
      'border-l-2',
      'border-transparent',
    );
    expect(readFileSync('src/styles/redesign.css', 'utf8')).not.toContain(
      'redesign-sidebar-menu-button',
    );
  });

  it('has no important declarations in the active redesign stylesheet', () => {
    const stylesheet = readFileSync('src/styles/redesign.css', 'utf8');
    expect(stylesheet).not.toContain('!important');
  });
});
