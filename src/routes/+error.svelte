<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>boboshan | error {page.status}</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<div class="pixel-container">
		<div class="text-center space-y-6">
			<div class="text-6xl text-accent font-pixel mb-4">
				{page.status}
			</div>

			<h1 class="text-lg text-light font-pixel">
				{#if page.status === 404}
					page not found
				{:else if page.status === 500}
					internal server error
				{:else}
					something went wrong
				{/if}
			</h1>

			<p class="text-sm text-light/70 leading-relaxed font-mono">
				{#if page.status === 404}
					The page you're looking for doesn't exist in this digital realm.
				{:else if page.status === 500}
					Something broke in the matrix. Our pixels are scrambled.
				{:else}
					An unexpected error occurred in the Game of Life.
				{/if}
			</p>

			{#if page.error?.message}
				<p class="text-xs text-light/40 font-mono">
					// {page.error.message}
				</p>
			{/if}

			<div class="pt-6">
				<a
					href="/"
					class="text-xs text-light/60 font-pixel inline-block transition-colors hover:text-accent"
				>
					&lt; back to home
				</a>
			</div>
		</div>
	</div>
</div>
