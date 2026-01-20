<script lang="ts">
	import { page } from '$app/state';

	const navItems = [
		{ href: '/', label: 'home' },
		{ href: '/posts', label: 'posts' },
		{ href: '/works', label: 'works' },
		{ href: '/about', label: 'about' }
	];

	let isMenuOpen = $state(false);

	function toggleMenu(): void {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu(): void {
		isMenuOpen = false;
	}
</script>

<nav class="p-4 left-0 right-0 top-0 fixed z-50">
	<div class="mx-auto flex max-w-4xl items-center justify-between">
		<a href="/" class="text-xs text-light font-pixel transition-colors hover:text-accent">
			boboshan
		</a>

		<!-- Desktop Navigation -->
		<div class="gap-6 hidden md:flex">
			{#each navItems.filter((item) => item.href !== '/') as item (item.href)}
				<a
					href={item.href}
					class="text-xs font-pixel transition-colors"
					class:text-accent={page.url.pathname === item.href}
					class:text-light={page.url.pathname !== item.href}
					class:hover:text-accent={page.url.pathname !== item.href}
				>
					{item.label}
				</a>
			{/each}
		</div>

		<!-- Mobile Menu Button -->
		<button
			class="text-xs text-light font-pixel p-2 transition-colors hover:text-accent md:hidden"
			onclick={toggleMenu}
			aria-label="Toggle menu"
			aria-expanded={isMenuOpen}
		>
			{isMenuOpen ? '[x]' : '[=]'}
		</button>
	</div>

	<!-- Mobile Navigation -->
	{#if isMenuOpen}
		<div class="mt-4 pixel-container md:hidden">
			<div class="flex flex-col gap-4">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="text-xs font-pixel py-2 transition-colors"
						class:text-accent={page.url.pathname === item.href}
						class:text-light={page.url.pathname !== item.href}
						onclick={closeMenu}
					>
						&gt; {item.label}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>

<style>
	nav {
		background: linear-gradient(to bottom, rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0) 100%);
	}
</style>
